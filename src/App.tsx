import { useState } from "react";
import {
	login as matrixLogin,
	rooms as matrixRooms,
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
}: {
	login?: typeof matrixLogin;
	rooms?: typeof matrixRooms;
}) {
	const [homeserverUrl, setHomeserverUrl] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [userId, setUserId] = useState<string | null>(null);
	const [roomList, setRoomList] = useState<Room[]>([]);
	const [error, setError] = useState<string | null>(null);

	if (userId) {
		return (
			<main className="app">
				<p>{userId}</p>
				<ul>
					{roomList.map((r) => (
						<li key={r.roomId}>{r.name}</li>
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
