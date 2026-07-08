import { useState } from "react";
import { createBackend, type MatrixBackend } from "./features/login/matrix";
import { recoverKey as matrixRecoverKey } from "./features/login/matrix";
import {
	onMessage as matrixOnMessage,
	rooms as matrixRooms,
	roomMessages as matrixRoomMessages,
	sendMessage as matrixSendMessage,
} from "./features/chat/matrix";
import { Login } from "./features/login/Login";
import { RoomList } from "./features/chat/RoomList";
import { Conversation } from "./features/chat/Conversation";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/login.css";
import "./styles/chat.css";

export default function App({
	login = createBackend().login,
	onMessage = matrixOnMessage,
	recoverKey = matrixRecoverKey,
	rooms = matrixRooms,
	roomMessages = matrixRoomMessages,
	sendMessage = matrixSendMessage,
}: {
	login?: MatrixBackend["login"];
	onMessage?: typeof matrixOnMessage;
	recoverKey?: typeof matrixRecoverKey;
	rooms?: typeof matrixRooms;
	roomMessages?: typeof matrixRoomMessages;
	sendMessage?: typeof matrixSendMessage;
}) {
	const [userId, setUserId] = useState<string | null>(null);
	const [openRoom, setOpenRoom] = useState<string | null>(null);

	if (openRoom && userId) {
		return (
			<Conversation
				openRoom={openRoom}
				userId={userId}
				roomMessages={roomMessages}
				sendMessage={sendMessage}
				onMessage={onMessage}
			/>
		);
	}

	if (userId) {
		return (
			<RoomList
				userId={userId}
				rooms={rooms}
				recoverKey={recoverKey}
				onOpenRoom={setOpenRoom}
			/>
		);
	}

	return <Login login={login} onLoggedIn={setUserId} />;
}
