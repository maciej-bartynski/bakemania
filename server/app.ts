
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import webPush from 'web-push';
import authRouter from './api/auth/router'
import notificationsRouter from './api/notifications/router';
import userRouter from './api/user/router';
import Middleware from './lib/middleware';
import stampsRouter from './api/admin/stamps/router';
import cors from 'cors';
import os from 'os';
import appConfigRouter from './api/appConfig/router';
import usersRouterForAdmin from './api/admin/users/router';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { WebSocketServer } from "ws";
import jwt from 'jsonwebtoken';
import connections from './wsConnections';
import path from 'path';

const app = express();
app.use(express.json());
app.use(cors());

// webPush.setVapidDetails(`mailto:${process.env.VAPID_MAILTO}`, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
app.use((req, res, next) => {
    /**
     * THIS IS LOGING MIDDLEWARE
     */
    next();
})

app.get('/api/ping', (req, res) => {
    res.status(204).send();
})
app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/user', Middleware.authenticateToken, userRouter);
app.use('/api/admin/stamps', Middleware.authenticateToken, Middleware.requireAdmin, stampsRouter);
app.use('/api/admin/users', Middleware.authenticateToken, Middleware.requireAdmin, usersRouterForAdmin);
app.use('/api/app-config', Middleware.authenticateToken, appConfigRouter);

app.use(express.static(path.resolve(__dirname, '../bakemania-spa/dist/.')));
// app.use(express.static('./public/.'));
// app.use(express.static('./static/.'));

// Gdy użytkownik przejdzie do ścieżki "/admin", zwróć admin.html
// app.get('/admin', (req, res) => {
//     res.sendFile(path.join(__dirname, 'static', 'admin.html'));
// });

// Dla wszystkich innych ścieżek, zwróć index.html
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'spa/dist/', 'index.html'));
//     // res.sendFile(path.join(__dirname, 'static', 'index.html'));
// });

const httpsPort = parseInt(process.env.PORT!);
const httpPort = httpsPort + 1;

const httpServer = http.createServer(app);
httpServer.listen(httpPort, () => {
    console.log(`HTTP: http://${getLocalIP()}:${httpPort}`);
    console.log(`HTTP: http://localhost:${httpPort}`);
});

/**
 * **How to generate cert**
 * @domain localhost 192.168.183.252
 * `mkcert -key-file key.pem -cert-file cert.pem {domain}`
 */
const httpsServer = https.createServer({
    key: fs.readFileSync(path.resolve(__dirname, '../key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../cert.pem')),
}, app);

httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS: https://${getLocalIP()}:${httpsPort}`);
    console.log(`HTTPS: https://localhost:${httpsPort}`);
});

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let iface of Object.values(interfaces)) {
        if (!iface) continue;
        for (let config of iface) {
            if (config.family === "IPv4" && !config.internal) {
                return config.address;
            }
        }
    }
    return "localhost";
}

const wsConnections = new Map();
// --- WebSocket Serwer dla HTTP ---
const wsHttpServer = new WebSocketServer({ server: httpServer });
wsHttpServer.on("connection", (ws) => {
    console.log("connection ws", ws)
    ws.on("message", (message) => {
        console.log(`Odebrano: ${message}`);
        ws.send(`Otrzymałem: ${message}`);
    });
});

// --- WebSocket Serwer dla HTTPS ---
const wsHttpsServer = new WebSocketServer({ server: httpsServer });
wsHttpsServer.on("connection", (ws, req) => {
    try {
        const [token, sessionId] = req.headers["sec-websocket-protocol"]?.split(', ') ?? [];
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!token || !JWT_SECRET) return null;

        jwt.verify(
            token,
            JWT_SECRET,
            async (err: any, user: any): Promise<void> => {

                console.log("veriftying", err, user)
                if (!err && user) {
                    const userId = user._id;
                    if (!userId) return;

                    if (connections.wss.has(userId)) {
                        connections.wss.get(userId).push(ws)
                    } else {
                        connections.wss.set(userId, [ws]);
                    }

                    ws.on("message", (message) => {
                        console.log(`Odebrano: ${message}`);
                        ws.send(`Otrzymałem: ${message}`);
                    });

                    ws.on('close', () => {
                        if (!connections.wss.has(userId)) return;

                        const updatedSockets = connections.wss.get(userId).filter((socket: any) => socket !== ws);

                        if (updatedSockets.length > 0) {
                            connections.wss.set(userId, updatedSockets);
                        } else {
                            connections.wss.delete(userId);
                        }
                    });
                }
            });
    } catch (e) {

    }
});