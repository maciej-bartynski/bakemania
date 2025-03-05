import WebSocket from "ws";

const connections = {
    wss: new Map(),
}

export const broadcastToUser = (userId: string, message: string) => {
    const sockets = connections.wss.get(userId) || [];
    sockets.forEach((wss: WebSocket) => {
        if (wss.readyState === WebSocket.OPEN) {
            wss.send(message);
        }
    });
};

export default connections