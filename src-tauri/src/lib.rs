use std::sync::Mutex;

use matrix_sdk::config::SyncSettings;
use matrix_sdk::room::MessagesOptions;
use matrix_sdk::ruma::events::{
    room::message::{MessageType, OriginalSyncRoomMessageEvent, RoomMessageEventContent},
    AnySyncMessageLikeEvent, AnySyncTimelineEvent,
};
use matrix_sdk::ruma::RoomId;
use matrix_sdk::Room;
use tauri::Emitter;

#[derive(Default)]
struct AppState {
    // ponytail: holds the logged-in client *handle* only — the SDK owns its own
    // session/crypto/store state (Arc-internally, thread-safe). This Mutex just
    // guards the None->Some slot across Tauri commands and is never held across .await.
    client: Mutex<Option<matrix_sdk::Client>>,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct LoginResult {
    user_id: String,
    device_id: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct RoomInfo {
    room_id: String,
    name: String,
}

#[derive(serde::Serialize, Clone, PartialEq, Debug)]
#[serde(rename_all = "camelCase")]
struct LiveMessage {
    room_id: String,
    sender: String,
    body: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct MessageInfo {
    sender: String,
    body: String,
}

fn client(state: &tauri::State<'_, AppState>) -> Result<matrix_sdk::Client, String> {
    state
        .client
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or_else(|| "not logged in".to_string())
}

async fn build_client(homeserver_url: &str) -> Result<matrix_sdk::Client, String> {
    matrix_sdk::Client::builder()
        .homeserver_url(homeserver_url)
        .build()
        .await
        .map_err(|e| e.to_string())
}

fn register_live_message_handler(client: &matrix_sdk::Client, app: tauri::AppHandle) {
    client.add_event_handler(move |ev: OriginalSyncRoomMessageEvent, room: Room| {
        let app = app.clone();
        async move {
            if let Some(msg) = live_message(
                ev.sender.as_ref(),
                &ev.content.msgtype,
                room.room_id().as_ref(),
                ev.unsigned.transaction_id.as_ref().map(|t| t.as_str()),
            ) {
                let _ = app.emit("message", msg);
            }
        }
    });
}

fn spawn_sync_loop(client: matrix_sdk::Client) {
    tauri::async_runtime::spawn(async move {
        // ponytail: sync forever, ignore transient errors so live updates
        // survive a blip. sync() resumes from the stored token.
        let _ = client.sync(SyncSettings::default()).await;
    });
}

#[tauri::command]
async fn login(
    state: tauri::State<'_, AppState>,
    app: tauri::AppHandle,
    homeserver_url: String,
    username: String,
    password: String,
) -> Result<LoginResult, String> {
    let client = build_client(&homeserver_url).await?;
    let response = client
        .matrix_auth()
        .login_username(&username, &password)
        .initial_device_display_name("igni-chat")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    // ponytail: self-sign this device so other clients show it as verified.
    // No-op if cross-signing already exists; best-effort (login still works on failure).
    let _ = client
        .encryption()
        .bootstrap_cross_signing_if_needed(None)
        .await;
    // Initial sync so the room list is populated before the UI asks, and so
    // the background loop below only receives *new* events.
    client
        .sync_once(SyncSettings::default())
        .await
        .map_err(|e| e.to_string())?;

    register_live_message_handler(&client, app);
    spawn_sync_loop(client.clone());

    *state.client.lock().map_err(|e| e.to_string())? = Some(client);
    Ok(LoginResult {
        user_id: response.user_id.to_string(),
        device_id: response.device_id.to_string(),
    })
}

#[tauri::command]
async fn rooms(state: tauri::State<'_, AppState>) -> Result<Vec<RoomInfo>, String> {
    let client = client(&state)?;
    Ok(client
        .rooms()
        .into_iter()
        .map(|room| {
            let room_id = room.room_id().to_string();
            RoomInfo {
                name: room.name().unwrap_or_else(|| room_id.clone()),
                room_id,
            }
        })
        .collect())
}

#[tauri::command]
async fn room_messages(
    state: tauri::State<'_, AppState>,
    room_id: String,
) -> Result<Vec<MessageInfo>, String> {
    let client = client(&state)?;
    let room_id = RoomId::parse(&room_id).map_err(|e| e.to_string())?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| "room not found".to_string())?;
    let messages = room
        .messages(MessagesOptions::backward())
        .await
        .map_err(|e| e.to_string())?;
    let mut out: Vec<MessageInfo> = Vec::new();
    for event in messages.chunk {
        let Ok(AnySyncTimelineEvent::MessageLike(AnySyncMessageLikeEvent::RoomMessage(msg))) =
            event.raw().deserialize()
        else {
            continue;
        };
        let Some(original) = msg.as_original() else {
            continue;
        };
        if let MessageType::Text(text) = &original.content.msgtype {
            out.push(MessageInfo {
                sender: original.sender.to_string(),
                body: text.body.clone(),
            });
        }
    }
    // ponytail: backward() returns newest-first; flip to chronological.
    out.reverse();
    Ok(out)
}

#[tauri::command]
async fn send_message(
    state: tauri::State<'_, AppState>,
    room_id: String,
    body: String,
) -> Result<(), String> {
    let client = client(&state)?;
    let room_id = RoomId::parse(&room_id).map_err(|e| e.to_string())?;
    let room = client
        .get_room(&room_id)
        .ok_or_else(|| "room not found".to_string())?;
    room.send(RoomMessageEventContent::text_plain(body))
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn recover_key(
    state: tauri::State<'_, AppState>,
    recovery_key: String,
) -> Result<(), String> {
    let client = client(&state)?;
    client
        .encryption()
        .recovery()
        .recover(&recovery_key)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Decide whether an incoming event becomes a live "message" event for the UI.
// Separated from the handler so the echo-skip / text-only logic has a check.
// Skip only the remote echo of *this device's* own send: the homeserver echoes
// the txn id back only to the originating device, so a message the same account
// sent from another device arrives here with no txn id and must be shown.
fn live_message(
    sender: &str,
    msgtype: &MessageType,
    room_id: &str,
    transaction_id: Option<&str>,
) -> Option<LiveMessage> {
    if transaction_id.is_some() {
        return None;
    }
    let MessageType::Text(text) = msgtype else {
        return None;
    };
    Some(LiveMessage {
        room_id: room_id.to_string(),
        sender: sender.to_string(),
        body: text.body.clone(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            login,
            rooms,
            room_messages,
            send_message,
            recover_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;
    use matrix_sdk::ruma::events::room::message::TextMessageEventContent;

    #[test]
    fn emits_a_text_message_from_another_user() {
        let text = MessageType::Text(TextMessageEventContent::plain("hi"));
        assert_eq!(
            live_message("@bob:localhost", &text, "!room:localhost", None),
            Some(LiveMessage {
                room_id: "!room:localhost".into(),
                sender: "@bob:localhost".into(),
                body: "hi".into(),
            })
        );
    }

    #[test]
    fn emits_a_message_sent_from_another_device_of_the_same_account() {
        let text = MessageType::Text(TextMessageEventContent::plain("from phone"));
        assert_eq!(
            live_message("@me:localhost", &text, "!room:localhost", None),
            Some(LiveMessage {
                room_id: "!room:localhost".into(),
                sender: "@me:localhost".into(),
                body: "from phone".into(),
            })
        );
    }

    #[test]
    fn suppresses_the_remote_echo_of_this_devices_own_send() {
        let text = MessageType::Text(TextMessageEventContent::plain("hi"));
        assert_eq!(
            live_message("@me:localhost", &text, "!room:localhost", Some("txn-1")),
            None
        );
    }
}
