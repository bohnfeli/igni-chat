import { invoke } from "@tauri-apps/api/core";

export type LoginResult = {
	userId: string;
	deviceId: string;
};

export function login(
	homeserverUrl: string,
	username: string,
	password: string,
): Promise<LoginResult> {
	return invoke<LoginResult>("login", {
		homeserverUrl,
		username,
		password,
	});
}

export function recoverKey(recoveryKey: string): Promise<void> {
	return invoke<void>("recover_key", { recoveryKey });
}
