use matrix_sdk::Client;
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResult {
    pub user_id: String,
    pub device_id: String,
}

pub struct IgniClient {
    client: Client,
}

impl IgniClient {
    pub async fn connect(homeserver_url: String) -> Result<Self, String> {
        let client = Client::builder()
            .homeserver_url(homeserver_url)
            .build()
            .await
            .map_err(|e| e.to_string())?;
        Ok(Self { client })
    }

    pub async fn login(&self, username: String, password: String) -> Result<LoginResult, String> {
        let response = self
            .client
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
}

pub async fn login(
    homeserver_url: String,
    username: String,
    password: String,
) -> Result<LoginResult, String> {
    let client = IgniClient::connect(homeserver_url).await?;
    client.login(username, password).await
}
