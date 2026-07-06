// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import loginRaw from "./styles/login.css?raw";

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

describe("post-login shell", () => {
	it("renders a two-pane shell with the room list as styled items", async () => {
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

		const item = await screen.findByRole("button", { name: /general/i });
		expect(item).toHaveClass("room-item");
		expect(item.querySelector(".room-item__avatar")).not.toBeNull();
		expect(item.querySelector(".room-item__name")?.textContent).toBe("General");
	});

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
