#[tauri::command]
async fn login(
    homeserver_url: String,
    username: String,
    password: String,
) -> Result<igni_matrix::LoginResult, String> {
    igni_matrix::login(homeserver_url, username, password).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
