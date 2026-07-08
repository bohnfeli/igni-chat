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

function wasmRequested(): boolean {
	return import.meta.env.VITE_MATRIX_BACKEND === "wasm";
}

export const wasmBackend: MatrixBackend = {
	login: async (homeserverUrl, username, password) => {
		const wasm = await import("../../../src-wasm/pkg/igni_matrix_wasm.js");
		await wasm.default();
		return wasm.login(homeserverUrl, username, password);
	},
};

export function createBackend(): MatrixBackend {
	if (isTauri()) {
		return tauriBackend;
	}
	if (wasmRequested()) {
		return wasmBackend;
	}
	if (import.meta.env.DEV) {
		return demoBackend;
	}
	throw new Error("no Matrix backend configured for this environment");
}

export const demoBackend: MatrixBackend = {
	login: async () => ({ userId: "@demo:localhost", deviceId: "DEMO" }),
};

export function login(
	homeserverUrl: string,
	username: string,
	password: string,
): Promise<LoginResult> {
	return tauriBackend.login(homeserverUrl, username, password);
}

export function recoverKey(recoveryKey: string): Promise<void> {
	return invoke<void>("recover_key", { recoveryKey });
}
