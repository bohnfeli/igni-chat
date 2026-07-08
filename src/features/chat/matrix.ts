import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export type Room = {
	roomId: string;
	name: string;
};

export type Message = {
	sender: string;
	body: string;
};

export type RoomMessage = {
	roomId: string;
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

export function onMessage(
	callback: (message: RoomMessage) => void,
): Promise<UnlistenFn> {
	return listen<RoomMessage>("message", (event) => callback(event.payload));
}
