import WebSocket from "ws";

const connections = {
    ws: new Map(),
    wss: new Map(),
}

export const broadcastToUser = (userId: string, message: string) => {
    console.log("message to sen:", message)
    const sockets = connections.wss.get(userId) || [];
    sockets.forEach((wss: WebSocket) => {
        console.log("found")
        if (wss.readyState === WebSocket.OPEN) {
            console.log("found and send")
            wss.send(message);
        }
    });
};

export default connections