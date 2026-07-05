import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
	it("exports a React component", () => {
		// ponytail: gate test — proves vitest + JSX transform + module graph work.
		// Replaced by real UI behavior tests as features land.
		expect(typeof App).toBe("function");
	});
});
