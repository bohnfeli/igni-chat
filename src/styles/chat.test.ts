// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import chatRaw from "./chat.css?raw";

const css = chatRaw.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ");

describe("message bubble styling", () => {
	it("renders received bubbles on surface and sent bubbles on an ember tint", () => {
		expect(css).toContain(".bubble");
		expect(css).toContain(".bubble--received");
		expect(css).toContain(
			".bubble--received { background: var(--color-surface)",
		);
		expect(css).toContain(".bubble--sent");
		expect(css).toContain(
			"color-mix(in srgb, var(--color-primary) 16%, var(--color-surface))",
		);
		expect(css).toContain("border-radius: var(--radius-lg)");
		expect(css).toContain("font: var(--font-body-lg)");
	});

	it("renders the sender as monospace to signal a Matrix identifier", () => {
		expect(css).toContain(".bubble__sender");
		expect(css).toContain("font: var(--font-mono)");
	});
});

describe("composer styling", () => {
	it("pins a surface field with an ember full-radius send disc", () => {
		expect(css).toContain(".composer");
		expect(css).toContain(".composer__field");
		expect(css).toContain(
			".composer__field { background: var(--color-surface)",
		);
		expect(css).toContain(".composer__send");
		expect(css).toContain("background: var(--color-primary)");
		expect(css).toContain("border-radius: var(--radius-full)");
	});

	it("dims the send disc when disabled", () => {
		expect(css).toContain(".composer__send:disabled");
	});
});

describe("encryption chip styling", () => {
	it("renders verified-green on a 16% verified tint with a small radius", () => {
		expect(css).toContain(".chip");
		expect(css).toContain(
			"color-mix(in srgb, var(--color-verified) 16%, transparent)",
		);
		expect(css).toContain("color: var(--color-verified)");
		expect(css).toContain("border-radius: var(--radius-sm)");
	});
});

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
