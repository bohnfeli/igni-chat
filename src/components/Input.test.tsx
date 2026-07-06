// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import inputRaw from "./Input.css?raw";
import { Input } from "./Input";

const css = inputRaw.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ");

describe("Input", () => {
	it("renders an input that forwards typing", async () => {
		const onChange = vi.fn();
		const user = userEvent.setup();
		render(<Input aria-label="username" onChange={onChange} />);
		const input = screen.getByLabelText("username");
		await user.type(input, "igni");
		expect((input as HTMLInputElement).value).toBe("igni");
	});

	it("forwards the type and placeholder", () => {
		render(<Input aria-label="pw" type="password" placeholder="secret" />);
		const input = screen.getByLabelText("pw");
		expect(input).toHaveAttribute("type", "password");
		expect(input).toHaveAttribute("placeholder", "secret");
	});

	it("drives styling from tokens with an ember focus ring", () => {
		expect(css).toContain("background: var(--color-surface)");
		expect(css).toContain("color: var(--color-on-surface)");
		expect(css).toContain("border-radius: var(--radius-md)");
		expect(css).toContain(".input:focus");
		expect(css).toContain("var(--color-primary)");
	});
});
