use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn login(
    homeserver_url: String,
    username: String,
    password: String,
) -> Result<JsValue, JsValue> {
    match igni_matrix::login(homeserver_url, username, password).await {
        Ok(result) => serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&e.to_string())),
        Err(message) => Err(JsValue::from_str(&message)),
    }
}
