// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
	it("logs in with the form fields and shows the userId", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const user = userEvent.setup();

		render(<App login={login} />);

		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));

		expect(login).toHaveBeenCalledWith(
			"http://localhost:8008",
			"igni",
			"dev-password",
		);
		expect(await screen.findByText("@igni:localhost")).toBeInTheDocument();
	});
});
