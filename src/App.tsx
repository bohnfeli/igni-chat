import { useState } from "react";
import {
	login as matrixLogin,
	rooms as matrixRooms,
	roomMessages as matrixRoomMessages,
	type Message,
	type Room,
} from "./matrix";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/login.css";

function App({
	login = matrixLogin,
	rooms = matrixRooms,
	roomMessages = matrixRoomMessages,
}: {
	login?: typeof matrixLogin;
	rooms?: typeof matrixRooms;
	roomMessages?: typeof matrixRoomMessages;
}) {
	const [homeserverUrl, setHomeserverUrl] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [userId, setUserId] = useState<string | null>(null);
	const [roomList, setRoomList] = useState<Room[]>([]);
	const [openRoom, setOpenRoom] = useState<string | null>(null);
	const [history, setHistory] = useState<Message[]>([]);
	const [error, setError] = useState<string | null>(null);

	if (openRoom) {
		return (
			<main>
				<ul>
					{history.map((m, i) => (
						<li key={i}>
							<strong>{m.sender}</strong>: {m.body}
						</li>
					))}
				</ul>
			</main>
		);
	}

	if (userId) {
		return (
			<main className="app">
				<p>{userId}</p>
				<ul>
					{roomList.map((r) => (
						<li key={r.roomId}>
							<button
								type="button"
								onClick={async () => {
									setOpenRoom(r.roomId);
									setHistory(await roomMessages(r.roomId));
								}}
							>
								{r.name}
							</button>
						</li>
					))}
				</ul>
			</main>
		);
	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		try {
			const result = await login(homeserverUrl, username, password);
			setUserId(result.userId);
			setRoomList(await rooms());
		} catch (e) {
			setError(String(e));
		}
	};

	return (
		<main className="app">
			<form className="login-card" onSubmit={onSubmit}>
				<h1 className="login-title">Igni-chat</h1>
				{error && (
					<p role="alert" className="login-error">
						{error}
					</p>
				)}
				<label className="login-field">
					homeserver
					<Input
						value={homeserverUrl}
						onChange={(e) => setHomeserverUrl(e.target.value)}
					/>
				</label>
				<label className="login-field">
					username
					<Input
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</label>
				<label className="login-field">
					password
					<Input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</label>
				<Button type="submit">Log in</Button>
			</form>
		</main>
	);
}

export default App;
