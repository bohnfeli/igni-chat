import { useState } from "react";
import { login as matrixLogin } from "./matrix";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/login.css";

function App({ login = matrixLogin }: { login?: typeof matrixLogin }) {
	const [homeserverUrl, setHomeserverUrl] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [userId, setUserId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	if (userId) {
		return (
			<main className="app">
				<p>{userId}</p>
			</main>
		);
	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);
		try {
			const result = await login(homeserverUrl, username, password);
			setUserId(result.userId);
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
