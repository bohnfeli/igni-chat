import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import type { MatrixBackend } from "./matrix";

export type LoginProps = {
	login: MatrixBackend["login"];
	onLoggedIn: (userId: string) => void;
};

export function Login({ login, onLoggedIn }: LoginProps) {
	const [homeserverUrl, setHomeserverUrl] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setError(null);
		try {
			const result = await login(homeserverUrl, username, password);
			onLoggedIn(result.userId);
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
