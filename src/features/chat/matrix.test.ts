import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({
	invoke: vi.fn(),
}));
vi.mock("@tauri-apps/api/event", () => ({
	listen: vi.fn(),
}));

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { rooms, roomMessages, sendMessage, onMessage } from "./matrix";

describe("rooms", () => {
	beforeEach(() => {
		vi.mocked(invoke).mockReset();
	});

	it("calls the rooms command and returns the parsed list", async () => {
		vi.mocked(invoke).mockResolvedValue([
			{ roomId: "!a:localhost", name: "General" },
		]);

		const result = await rooms();

		expect(invoke).toHaveBeenCalledWith("rooms");
		expect(result).toEqual([{ roomId: "!a:localhost", name: "General" }]);
	});
});

describe("roomMessages", () => {
	beforeEach(() => {
		vi.mocked(invoke).mockReset();
	});

	it("calls the room_messages command with the roomId and returns the parsed list", async () => {
		vi.mocked(invoke).mockResolvedValue([
			{ sender: "@igni:localhost", body: "hello" },
		]);

		const result = await roomMessages("!general:localhost");

		expect(invoke).toHaveBeenCalledWith("room_messages", {
			roomId: "!general:localhost",
		});
		expect(result).toEqual([{ sender: "@igni:localhost", body: "hello" }]);
	});
});

describe("sendMessage", () => {
	beforeEach(() => {
		vi.mocked(invoke).mockReset();
	});

	it("calls the send_message command with the roomId and body", async () => {
		vi.mocked(invoke).mockResolvedValue(undefined);

		await sendMessage("!general:localhost", "hi there");

		expect(invoke).toHaveBeenCalledWith("send_message", {
			roomId: "!general:localhost",
			body: "hi there",
		});
	});
});

describe("onMessage", () => {
	beforeEach(() => {
		vi.mocked(listen).mockReset();
	});

	it("listens for message events, forwards the payload, and returns the unlisten fn", async () => {
		const unlisten = vi.fn();
		let registered: ((event: { payload: unknown }) => void) | undefined;
		vi.mocked(listen).mockImplementation((_event, handler) => {
			registered = handler as (event: { payload: unknown }) => void;
			return Promise.resolve(unlisten);
		});

		const callback = vi.fn();
		const stop = await onMessage(callback);

		expect(listen).toHaveBeenCalledWith("message", expect.any(Function));
		registered!({
			payload: { roomId: "!a:localhost", sender: "@bob:localhost", body: "hi" },
		});
		expect(callback).toHaveBeenCalledWith({
			roomId: "!a:localhost",
			sender: "@bob:localhost",
			body: "hi",
		});

		stop();
		expect(unlisten).toHaveBeenCalledTimes(1);
	});
});
