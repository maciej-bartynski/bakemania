import WebSocket from "ws";

const connections = {
    wss: new Map(),
}

export const broadcastToUser = (userId: string, message: string) => {
    const socket = connections.wss.get(userId);
    if (socket) {

        if (socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        }

    }
};

export default connections