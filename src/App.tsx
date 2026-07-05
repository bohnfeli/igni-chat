import { useState } from "react";
import { login as matrixLogin } from "./matrix";

function App({ login = matrixLogin }: { login?: typeof matrixLogin }) {
	const [homeserverUrl, setHomeserverUrl] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [userId, setUserId] = useState<string | null>(null);

	if (userId) {
		return (
			<main>
				<p>{userId}</p>
			</main>
		);
	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const result = await login(homeserverUrl, username, password);
		setUserId(result.userId);
	};

	return (
		<main>
			<h1>Igni-chat</h1>
			<form onSubmit={onSubmit}>
				<label>
					homeserver
					<input
						value={homeserverUrl}
						onChange={(e) => setHomeserverUrl(e.target.value)}
					/>
				</label>
				<label>
					username
					<input
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</label>
				<label>
					password
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</label>
				<button type="submit">Log in</button>
			</form>
		</main>
	);
}

export default App;
