// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import buttonRaw from "./Button.css?raw";
import { Button } from "./Button";

const css = buttonRaw.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ");

describe("Button", () => {
	it("renders a button with its children and fires onClick", async () => {
		const onClick = vi.fn();
		const user = userEvent.setup();
		render(<Button onClick={onClick}>Log in</Button>);
		const button = screen.getByRole("button", { name: /log in/i });
		await user.click(button);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("defaults to the primary variant", () => {
		render(<Button>Save</Button>);
		expect(screen.getByRole("button")).toHaveClass("button--primary");
	});

	it("applies the secondary variant class", () => {
		render(<Button variant="secondary">Cancel</Button>);
		expect(screen.getByRole("button")).toHaveClass("button--secondary");
	});

	it("drives primary styling from tokens with a hover state", () => {
		expect(css).toContain("background: var(--color-primary)");
		expect(css).toContain("color: var(--color-on-primary)");
		expect(css).toContain(".button--primary:hover");
		expect(css).toContain("background: #ff8055");
	});

	it("drives secondary styling from tokens", () => {
		expect(css).toContain("background: transparent");
		expect(css).toContain("color: var(--color-on-surface)");
	});
});
