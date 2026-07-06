import { invoke } from "@tauri-apps/api/core";

export type LoginResult = {
	userId: string;
	deviceId: string;
};

export type Room = {
	roomId: string;
	name: string;
};

export type Message = {
	sender: string;
	body: string;
};

export function rooms(): Promise<Room[]> {
	return invoke<Room[]>("rooms");
}

export function roomMessages(roomId: string): Promise<Message[]> {
	return invoke<Message[]>("room_messages", { roomId });
}

export function sendMessage(roomId: string, body: string): Promise<void> {
	return invoke<void>("send_message", { roomId, body });
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
