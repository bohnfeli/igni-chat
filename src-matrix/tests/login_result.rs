use igni_matrix::LoginResult;

#[test]
fn login_result_serializes_camel_case() {
    let result = LoginResult {
        user_id: "@igni:localhost".to_string(),
        device_id: "DEVID".to_string(),
    };
    let json = serde_json::to_string(&result).expect("serialize");
    assert_eq!(json, r#"{"userId":"@igni:localhost","deviceId":"DEVID"}"#);
}
