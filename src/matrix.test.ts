import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({
	invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
import {
	login,
	tauriBackend,
	isTauri,
	createBackend,
	demoBackend,
} from "./matrix";

describe("login", () => {
	beforeEach(() => {
		vi.mocked(invoke).mockReset();
	});

	it("calls the login command with the fields and returns the parsed result", async () => {
		vi.mocked(invoke).mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});

		const result = await login("http://localhost:8008", "igni", "dev-password");

		expect(invoke).toHaveBeenCalledWith("login", {
			homeserverUrl: "http://localhost:8008",
			username: "igni",
			password: "dev-password",
		});
		expect(result).toEqual({ userId: "@igni:localhost", deviceId: "DEVID" });
	});

	it("propagates the invoke rejection as the error message", async () => {
		vi.mocked(invoke).mockRejectedValue("bad credentials");

		await expect(login("u", "n", "p")).rejects.toBe("bad credentials");
	});
});

describe("isTauri", () => {
	const g = globalThis as { __TAURI_INTERNALS__?: unknown };

	afterEach(() => {
		delete g.__TAURI_INTERNALS__;
	});

	it("returns true when __TAURI_INTERNALS__ is present", () => {
		g.__TAURI_INTERNALS__ = {};
		expect(isTauri()).toBe(true);
	});

	it("returns false when __TAURI_INTERNALS__ is absent", () => {
		delete g.__TAURI_INTERNALS__;
		expect(isTauri()).toBe(false);
	});
});

describe("createBackend", () => {
	const g = globalThis as { __TAURI_INTERNALS__?: unknown };

	afterEach(() => {
		delete g.__TAURI_INTERNALS__;
	});

	it("returns the tauri backend when running under Tauri", () => {
		g.__TAURI_INTERNALS__ = {};
		expect(createBackend()).toBe(tauriBackend);
	});

	it("returns the demo backend in a non-Tauri dev environment", () => {
		delete g.__TAURI_INTERNALS__;
		expect(createBackend()).toBe(demoBackend);
	});

	it("throws in a non-Tauri production build", () => {
		delete g.__TAURI_INTERNALS__;
		const dev = import.meta.env.DEV;
		import.meta.env.DEV = false;
		try {
			expect(() => createBackend()).toThrow(/no Matrix backend/);
		} finally {
			import.meta.env.DEV = dev;
		}
	});
});

describe("tauriBackend.login", () => {
	beforeEach(() => {
		vi.mocked(invoke).mockReset();
	});

	it("delegates to the login command with camelCased args and returns the result", async () => {
		vi.mocked(invoke).mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});

		const result = await tauriBackend.login("http://localhost:8008", "igni", "pw");

		expect(invoke).toHaveBeenCalledWith("login", {
			homeserverUrl: "http://localhost:8008",
			username: "igni",
			password: "pw",
		});
		expect(result).toEqual({ userId: "@igni:localhost", deviceId: "DEVID" });
	});
});

describe("demoBackend.login", () => {
	it("returns a canned login result without contacting a server", async () => {
		await expect(demoBackend.login("http://h", "u", "p")).resolves.toEqual({
			userId: "@demo:localhost",
			deviceId: "DEMO",
		});
	});
});
