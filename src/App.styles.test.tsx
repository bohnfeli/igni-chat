// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";

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
});
