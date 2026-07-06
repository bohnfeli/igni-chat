// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import chatRaw from "./chat.css?raw";

const css = chatRaw.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ");

describe("chat shell styling", () => {
	it("lays out a two-pane shell: fixed rail + fluid conversation", () => {
		expect(css).toContain(".shell");
		expect(css).toContain(".shell__rail");
		expect(css).toContain("280px");
		expect(css).toContain("flex");
	});

	it("drives the room-list item from tokens with a hover lift", () => {
		expect(css).toContain(".room-item");
		expect(css).toContain("padding: var(--space-sm) var(--space-md)");
		expect(css).toContain("border-radius: var(--radius-md)");
		expect(css).toContain(".room-item:hover");
		expect(css).toContain("background: var(--color-surface-high)");
	});
});
