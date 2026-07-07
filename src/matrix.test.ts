import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({
	invoke: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
import { login, tauriBackend } from "./matrix";

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
