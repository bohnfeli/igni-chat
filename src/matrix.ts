import { invoke } from "@tauri-apps/api/core";

export type LoginResult = {
	userId: string;
	deviceId: string;
};

export type Room = {
	roomId: string;
	name: string;
};

export function rooms(): Promise<Room[]> {
	return invoke<Room[]>("rooms");
}

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
