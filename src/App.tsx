import { useState, useEffect } from "react";
import {
	login as matrixLogin,
	onMessage as matrixOnMessage,
	recoverKey as matrixRecoverKey,
	rooms as matrixRooms,
	roomMessages as matrixRoomMessages,
	sendMessage as matrixSendMessage,
	type Message,
	type Room,
} from "./matrix";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/login.css";
import "./styles/chat.css";

function initials(name: string): string {
	return name.replace(/^!/, "").charAt(0).toUpperCase() || "?";
}

function App({
	login = matrixLogin,
	onMessage = matrixOnMessage,
	recoverKey = matrixRecoverKey,
	rooms = matrixRooms,
	roomMessages = matrixRoomMessages,
	sendMessage = matrixSendMessage,
}: {
	login?: typeof matrixLogin;
	onMessage?: typeof matrixOnMessage;
	recoverKey?: typeof matrixRecoverKey;
	rooms?: typeof matrixRooms;
	roomMessages?: typeof matrixRoomMessages;
	sendMessage?: typeof matrixSendMessage;
}) {
	const [homeserverUrl, setHomeserverUrl] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [userId, setUserId] = useState<string | null>(null);
	const [roomList, setRoomList] = useState<Room[]>([]);
	const [openRoom, setOpenRoom] = useState<string | null>(null);
	const [history, setHistory] = useState<Message[]>([]);
	const [draft, setDraft] = useState("");
	const [recoveryKeyInput, setRecoveryKeyInput] = useState("");
	const [recovered, setRecovered] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!openRoom) return;
		let unlisten: (() => void) | undefined;
		onMessage((message) => {
			if (message.roomId === openRoom) {
				setHistory((prev) => [
					...prev,
					{ sender: message.sender, body: message.body },
				]);
			}
		}).then((u) => {
			unlisten = u;
		});
		return () => unlisten?.();
	}, [openRoom, onMessage]);

	if (openRoom) {
		const onSend = async (event: React.FormEvent) => {
			event.preventDefault();
			const body = draft.trim();
			if (!body) return;
			setError(null);
			try {
				await sendMessage(openRoom, body);
			} catch (e) {
				setError(String(e));
				return; // keep the draft so the message is not lost on a failed send
			}
			setDraft("");
			setHistory((prev) => [...prev, { sender: userId ?? "", body }]);
		};
		return (
			<main className="shell">
				<section className="shell__conversation">
					<header className="conversation__header">
						<span className="chip">🔒 Encrypted</span>
					</header>
					<ol className="timeline">
						{history.map((m, i) => {
							const sent = m.sender === userId;
							return (
								<li
									key={i}
									className={`bubble ${sent ? "bubble--sent" : "bubble--received"}`}
								>
									{!sent && <p className="bubble__sender">{m.sender}</p>}
									{m.body}
								</li>
							);
						})}
					</ol>
					{error && (
						<p role="alert" className="login-error">
							{error}
						</p>
					)}
					<form className="composer" onSubmit={onSend}>
						<input
							className="composer__field"
							aria-label="message"
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
						/>
						<button
							type="submit"
							className="composer__send"
							aria-label="send"
							disabled={draft.trim() === ""}
						>
							➤
						</button>
					</form>
				</section>
			</main>
		);
	}

	if (userId) {
		const onRecover = async (event: React.FormEvent) => {
			event.preventDefault();
			setError(null);
			try {
				await recoverKey(recoveryKeyInput);
				setRecoveryKeyInput("");
				setRecovered(true);
			} catch (e) {
				setError(String(e));
			}
		};
		return (
			<main className="shell">
				<aside className="shell__rail">
					<p className="rail__user">{userId}</p>
					{recovered ? (
						<p className="room-item__preview">keys recovered</p>
					) : (
						<form className="login-card" onSubmit={onRecover}>
							{error && (
								<p role="alert" className="login-error">
									{error}
								</p>
							)}
							<label className="login-field">
								recovery key
								<Input
									value={recoveryKeyInput}
									onChange={(e) => setRecoveryKeyInput(e.target.value)}
								/>
							</label>
							<Button type="submit">recover</Button>
						</form>
					)}
					<ul>
						{roomList.map((r) => (
							<li key={r.roomId}>
								<button
									type="button"
									className="room-item"
									onClick={async () => {
										setOpenRoom(r.roomId);
										setHistory(await roomMessages(r.roomId));
									}}
								>
									<span className="room-item__avatar" aria-hidden="true">
										{initials(r.name)}
									</span>
									<span className="room-item__main">
										<span className="room-item__name">{r.name}</span>
									</span>
								</button>
							</li>
						))}
					</ul>
				</aside>
				<section className="shell__conversation" />
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
