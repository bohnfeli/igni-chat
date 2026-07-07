use matrix_sdk::Client;
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResult {
    pub user_id: String,
    pub device_id: String,
}

pub async fn login(
    homeserver_url: String,
    username: String,
    password: String,
) -> Result<LoginResult, String> {
    let client = Client::builder()
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
    Ok(LoginResult {
        user_id: response.user_id.to_string(),
        device_id: response.device_id.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn login_result_serializes_camel_case() {
        let result = LoginResult {
            user_id: "@igni:localhost".to_string(),
            device_id: "DEVID".to_string(),
        };
        let json = serde_json::to_string(&result).expect("serialize");
        assert_eq!(
            json,
            r#"{"userId":"@igni:localhost","deviceId":"DEVID"}"#
        );
    }
}
