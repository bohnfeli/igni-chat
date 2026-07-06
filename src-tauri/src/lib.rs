use std::sync::Mutex;

use matrix_sdk::config::SyncSettings;
use matrix_sdk::room::MessagesOptions;
use matrix_sdk::ruma::events::{
    room::message::{MessageType, RoomMessageEventContent},
    AnySyncMessageLikeEvent, AnySyncTimelineEvent,
};
use matrix_sdk::ruma::RoomId;

#[derive(Default)]
struct AppState {
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

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct MessageInfo {
    sender: String,
    body: String,
}

#[tauri::command]
async fn login(
    state: tauri::State<'_, AppState>,
    homeserver_url: String,
    username: String,
    password: String,
) -> Result<LoginResult, String> {
    let client = matrix_sdk::Client::builder()
        .homeserver_url(homeserver_url)
        .build()
        .await
        .map_err(|e| e.to_string())?;
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
    *state.client.lock().map_err(|e| e.to_string())? = Some(client);
    Ok(LoginResult {
        user_id: response.user_id.to_string(),
        device_id: response.device_id.to_string(),
    })
}

#[tauri::command]
async fn rooms(state: tauri::State<'_, AppState>) -> Result<Vec<RoomInfo>, String> {
    let client = {
        let guard = state.client.lock().map_err(|e| e.to_string())?;
        guard
            .clone()
            .ok_or_else(|| "not logged in".to_string())?
    };
    client
        .sync_once(SyncSettings::default())
        .await
        .map_err(|e| e.to_string())?;
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
    let client = {
        let guard = state.client.lock().map_err(|e| e.to_string())?;
        guard
            .clone()
            .ok_or_else(|| "not logged in".to_string())?
    };
    let room_id =
        RoomId::parse(&room_id).map_err(|e| e.to_string())?;
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
    let client = {
        let guard = state.client.lock().map_err(|e| e.to_string())?;
        guard
            .clone()
            .ok_or_else(|| "not logged in".to_string())?
    };
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
    let client = {
        let guard = state.client.lock().map_err(|e| e.to_string())?;
        guard
            .clone()
            .ok_or_else(|| "not logged in".to_string())?
    };
    client
        .encryption()
        .recovery()
        .recover(&recovery_key)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
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
