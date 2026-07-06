// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
