import { invoke } from "@tauri-apps/api/core";

export type LoginResult = {
	userId: string;
	deviceId: string;
};

export interface MatrixBackend {
	login(
		homeserverUrl: string,
		username: string,
		password: string,
	): Promise<LoginResult>;
}

export const tauriBackend: MatrixBackend = {
	login: (homeserverUrl, username, password) =>
		invoke<LoginResult>("login", { homeserverUrl, username, password }),
};

export function isTauri(): boolean {
	return "__TAURI_INTERNALS__" in globalThis;
}

export function login(
	homeserverUrl: string,
	username: string,
	password: string,
): Promise<LoginResult> {
	return tauriBackend.login(homeserverUrl, username, password);
}
