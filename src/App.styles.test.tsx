// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import type { LoginResult, Message, Room } from "./matrix";
import loginRaw from "./styles/login.css?raw";

vi.mock("@tauri-apps/api/event", () => ({
	listen: vi.fn().mockResolvedValue(() => {}),
}));

const loginCss = loginRaw.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ");

describe("app base styling", () => {
	it("loads design tokens and drives body styles from them", () => {
		render(<App />);
		const css = Array.from(document.querySelectorAll("style"))
			.map((s) => s.textContent ?? "")
			.join("");
		expect(css).toContain("--color-canvas");
		expect(css).toContain("var(--color-canvas)");
		expect(css).toContain("var(--color-on-surface)");
	});

	it("renders the submit button from the Button atom", () => {
		render(<App />);
		expect(screen.getByRole("button", { name: /log in/i })).toHaveClass(
			"button--primary",
		);
	});

	it("renders fields from the Input atom", () => {
		render(<App />);
		expect(screen.getByLabelText(/homeserver/i)).toHaveClass("input");
	});

	it("drives the login card layout from tokens", () => {
		expect(loginCss).toContain("background: var(--color-surface)");
		expect(loginCss).toContain("font: var(--font-display)");
		expect(loginCss).toContain("color: var(--color-error)");
	});
});

describe("recovery form", () => {
	it("renders the recovery form from the Input and Button atoms", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const rooms = vi.fn().mockResolvedValue([]);
		const recoverKey = vi.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();
		render(<App login={login} rooms={rooms} recoverKey={recoverKey} />);
		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));

		expect(await screen.findByLabelText(/recovery key/i)).toHaveClass("input");
		expect(screen.getByRole("button", { name: /recover/i })).toHaveClass(
			"button--primary",
		);
	});
});

describe("room list", () => {
	it("renders each room as a styled item with avatar and name", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const rooms = vi
			.fn()
			.mockResolvedValue([{ roomId: "!general:localhost", name: "General" }]);
		const user = userEvent.setup();
		render(<App login={login} rooms={rooms} />);
		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));

		const item = await screen.findByRole("button", { name: "General" });
		expect(item).toHaveClass("room-item");
		expect(
			item.querySelector(".room-item__avatar")?.getAttribute("aria-hidden"),
		).toBe("true");
		expect(item.querySelector(".room-item__name")?.textContent).toBe("General");
	});
});

describe("chat shell", () => {
	it("lays out the post-login view as a fixed rail and a fluid conversation pane", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const rooms = vi
			.fn()
			.mockResolvedValue([{ roomId: "!general:localhost", name: "General" }]);
		const user = userEvent.setup();
		render(<App login={login} rooms={rooms} />);
		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));

		const shell = await screen.findByRole("main");
		expect(shell).toHaveClass("shell");
		expect(shell.querySelector(".shell__rail")).not.toBeNull();
		expect(shell.querySelector(".shell__conversation")).not.toBeNull();
	});
});

describe("conversation view", () => {
	async function openRoom(
		overrides: {
			login?: (
				homeserverUrl: string,
				username: string,
				password: string,
			) => Promise<LoginResult>;
			rooms?: () => Promise<Room[]>;
			roomMessages?: (roomId: string) => Promise<Message[]>;
		} = {},
	) {
		const login =
			overrides.login ??
			(() =>
				Promise.resolve({
					userId: "@igni:localhost",
					deviceId: "DEVID",
				}));
		const rooms =
			overrides.rooms ??
			(() =>
				Promise.resolve([{ roomId: "!general:localhost", name: "General" }]));
		const user = userEvent.setup();
		render(
			<App login={login} rooms={rooms} roomMessages={overrides.roomMessages} />,
		);
		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));
		await user.click(await screen.findByRole("button", { name: "General" }));
		return user;
	}

	it("renders a received message on surface and a sent message on an ember-tinted bubble", async () => {
		await openRoom({
			roomMessages: () =>
				Promise.resolve([
					{ sender: "@bob:localhost", body: "theirs" },
					{ sender: "@igni:localhost", body: "mine" },
				]),
		});

		const theirs = (await screen.findByText(/theirs/)).closest(".bubble");
		expect(theirs).toHaveClass("bubble--received");
		const mine = screen.getByText(/mine/).closest(".bubble");
		expect(mine).toHaveClass("bubble--sent");
	});

	it("shows an encryption chip on the conversation header", async () => {
		await openRoom({ roomMessages: () => Promise.resolve([]) });
		expect(screen.getByText(/encrypted/i)).toHaveClass("chip");
	});

	it("disables the send button until the composer has text", async () => {
		const user = await openRoom({ roomMessages: () => Promise.resolve([]) });
		const send = screen.getByRole("button", { name: /send/i });
		expect(send).toBeDisabled();
		await user.type(screen.getByLabelText(/message/i), "hello");
		expect(send).not.toBeDisabled();
	});
});
