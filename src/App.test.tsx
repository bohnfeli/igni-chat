// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

vi.mock("@tauri-apps/api/event", () => ({
	listen: vi.fn().mockResolvedValue(() => {}),
}));

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

	it("renders the room list after login", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const rooms = vi.fn().mockResolvedValue([
			{ roomId: "!general:localhost", name: "General" },
			{ roomId: "!random:localhost", name: "Random" },
		]);
		const user = userEvent.setup();
		render(<App login={login} rooms={rooms} />);

		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));

		expect(await screen.findByText("General")).toBeInTheDocument();
		expect(await screen.findByText("Random")).toBeInTheDocument();
		expect(rooms).toHaveBeenCalledTimes(1);
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

	it("renders the room history when a room is clicked", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const rooms = vi
			.fn()
			.mockResolvedValue([{ roomId: "!general:localhost", name: "General" }]);
		const roomMessages = vi.fn().mockResolvedValue([
			{ sender: "@igni:localhost", body: "hello" },
			{ sender: "@bob:localhost", body: "world" },
		]);
		const user = userEvent.setup();
		render(<App login={login} rooms={rooms} roomMessages={roomMessages} />);

		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));

		await user.click(await screen.findByRole("button", { name: "General" }));

		expect(await screen.findByText(/hello/)).toBeInTheDocument();
		expect(await screen.findByText(/world/)).toBeInTheDocument();
		expect(roomMessages).toHaveBeenCalledWith("!general:localhost");
	});

	it("sends a message from the composer and clears the input", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const rooms = vi
			.fn()
			.mockResolvedValue([{ roomId: "!general:localhost", name: "General" }]);
		const roomMessages = vi.fn().mockResolvedValue([]);
		const sendMessage = vi.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();
		render(
			<App
				login={login}
				rooms={rooms}
				roomMessages={roomMessages}
				sendMessage={sendMessage}
			/>,
		);

		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));
		await user.click(await screen.findByRole("button", { name: "General" }));

		await user.type(screen.getByLabelText(/message/i), "fresh from composer");
		await user.click(screen.getByRole("button", { name: /send/i }));

		expect(await screen.findByText(/fresh from composer/)).toBeInTheDocument();
		expect(sendMessage).toHaveBeenCalledWith(
			"!general:localhost",
			"fresh from composer",
		);
		expect(screen.getByLabelText(/message/i)).toHaveValue("");
	});

	it("keeps the draft and shows an error when send fails", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const rooms = vi
			.fn()
			.mockResolvedValue([{ roomId: "!general:localhost", name: "General" }]);
		const roomMessages = vi.fn().mockResolvedValue([]);
		const sendMessage = vi.fn().mockRejectedValue("send failed");
		const user = userEvent.setup();
		render(
			<App
				login={login}
				rooms={rooms}
				roomMessages={roomMessages}
				sendMessage={sendMessage}
			/>,
		);

		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));
		await user.click(await screen.findByRole("button", { name: "General" }));

		const field = await screen.findByLabelText(/message/i);
		await user.type(field, "will not send");
		await user.click(screen.getByRole("button", { name: /send/i }));

		expect(await screen.findByText(/send failed/)).toBeInTheDocument();
		expect(field).toHaveValue("will not send");
		expect(screen.queryByText("will not send")).not.toBeInTheDocument();
	});

	it("appends a live message received for the open room", async () => {
		const login = vi.fn().mockResolvedValue({
			userId: "@igni:localhost",
			deviceId: "DEVID",
		});
		const rooms = vi
			.fn()
			.mockResolvedValue([{ roomId: "!general:localhost", name: "General" }]);
		const roomMessages = vi.fn().mockResolvedValue([]);
		let live:
			| ((m: { roomId: string; sender: string; body: string }) => void)
			| undefined;
		const onMessage = vi
			.fn()
			.mockImplementation(
				(cb: (m: { roomId: string; sender: string; body: string }) => void) => {
					live = cb;
					return Promise.resolve(() => {});
				},
			);
		const user = userEvent.setup();
		render(
			<App
				login={login}
				rooms={rooms}
				roomMessages={roomMessages}
				onMessage={onMessage}
			/>,
		);

		await user.type(
			screen.getByLabelText(/homeserver/i),
			"http://localhost:8008",
		);
		await user.type(screen.getByLabelText(/username/i), "igni");
		await user.type(screen.getByLabelText(/password/i), "dev-password");
		await user.click(screen.getByRole("button", { name: /log in/i }));
		await user.click(await screen.findByRole("button", { name: "General" }));
		await screen.findByLabelText(/message/i);

		live!({
			roomId: "!general:localhost",
			sender: "@bob:localhost",
			body: "live one",
		});

		expect(await screen.findByText(/live one/)).toBeInTheDocument();
	});

	it("submits the recovery key after login", async () => {
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

		await user.type(screen.getByLabelText(/recovery key/i), "EsTL-2n0X");
		await user.click(screen.getByRole("button", { name: /recover/i }));

		expect(await screen.findByText(/recovered/i)).toBeInTheDocument();
		expect(recoverKey).toHaveBeenCalledWith("EsTL-2n0X");
	});
});
