import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import type { recoverKey as matrixRecoverKey, Room } from "../../matrix";

export type RoomListProps = {
	userId: string;
	rooms: () => Promise<Room[]>;
	recoverKey: typeof matrixRecoverKey;
	onOpenRoom: (roomId: string) => void;
};

function initials(name: string): string {
	return name.replace(/^!/, "").charAt(0).toUpperCase() || "?";
}

export function RoomList({
	userId,
	rooms,
	recoverKey,
	onOpenRoom,
}: RoomListProps) {
	const [roomList, setRoomList] = useState<Room[]>([]);
	const [recoveryKeyInput, setRecoveryKeyInput] = useState("");
	const [recovered, setRecovered] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		rooms()
			.then(setRoomList)
			.catch(() => {});
	}, [rooms]);

	const onRecover = async (event: FormEvent) => {
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
								onClick={() => onOpenRoom(r.roomId)}
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
