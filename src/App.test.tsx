// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { createBackend } from "./matrix";

vi.mock("./matrix", async (importOriginal) => {
	const actual = await importOriginal<typeof import("./matrix")>();
	return { ...actual, createBackend: vi.fn() };
});

describe("App", () => {
	beforeEach(() => {
		vi.mocked(createBackend).mockReset();
	});
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

	it("shows the error message and keeps the form when login fails", async () => {
		const login = vi.fn().mockRejectedValue("bad credentials");
		const user = userEvent.setup();

		render(<App login={login} />);

		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));

		expect(await screen.findByText("bad credentials")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
	});

	it("uses the backend's login by default and shows the userId", async () => {
		const backendLogin = vi
			.fn()
			.mockResolvedValue({ userId: "@dflt:local", deviceId: "DFLT" });
		vi.mocked(createBackend).mockReturnValue({ login: backendLogin });
		const user = userEvent.setup();

		render(<App />);

		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));

		expect(backendLogin).toHaveBeenCalledWith(
			"http://localhost:8008",
			"igni",
			"dev-password",
		);
		expect(await screen.findByText("@dflt:local")).toBeInTheDocument();
	});
});
