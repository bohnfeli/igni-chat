use std::sync::Mutex;

use matrix_sdk::config::SyncSettings;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![login, rooms])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
