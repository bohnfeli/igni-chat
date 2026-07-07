import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type {
	onMessage as matrixOnMessage,
	roomMessages as matrixRoomMessages,
	sendMessage as matrixSendMessage,
	Message,
} from "../../matrix";

export type ConversationProps = {
	openRoom: string;
	userId: string;
	roomMessages: typeof matrixRoomMessages;
	sendMessage: typeof matrixSendMessage;
	onMessage: typeof matrixOnMessage;
};

export function Conversation({
	openRoom,
	userId,
	roomMessages,
	sendMessage,
	onMessage,
}: ConversationProps) {
	const [history, setHistory] = useState<Message[]>([]);
	const [draft, setDraft] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		roomMessages(openRoom).then((messages) => {
			if (active) setHistory(messages);
		});
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
		return () => {
			active = false;
			unlisten?.();
		};
	}, [openRoom, roomMessages, onMessage]);

	const onSend = async (event: FormEvent) => {
		event.preventDefault();
		const body = draft.trim();
		if (!body) return;
		setError(null);
		try {
			await sendMessage(openRoom, body);
		} catch (e) {
			setError(String(e));
			return;
		}
		setDraft("");
		setHistory((prev) => [...prev, { sender: userId, body }]);
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
