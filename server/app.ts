
import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
    const prodEnvFile = path.resolve(__dirname, '../.env.prod');
    const devEnvFile = path.resolve(__dirname, '../.env.dev');
    dotenv.config({ path: process.env.NODE_ENV === 'production' ? prodEnvFile : devEnvFile });
} else {
    // const prodEnvFile = path.resolve(__dirname, '../.env.prod');
    // dotenv.config({ path: prodEnvFile });
    /**
     * Docker will populate
     * See Dockerfile
     */
}

import express from 'express';
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

const app = express();
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
    app.use(cors());
} else {
    // const corsOptions = {
    //     origin: 'https://bakemania.ovh',  // Jeśli chcesz ograniczyć tylko do tej domeny
    //     methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // };
    app.use(cors(
        // corsOptions
    ));
}

app.use((req, res, next) => {
    /**
     * THIS IS LOGING MIDDLEWARE
     */
    next();
})

app.get('/api/ping', (req, res) => {
    /**
     * THIS IS PING ROUTE
     */
    res.status(204).send();
})

app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/user', Middleware.authenticateToken, userRouter);
app.use('/api/admin/stamps', Middleware.authenticateToken, Middleware.requireAdmin, stampsRouter);
app.use('/api/admin/users', Middleware.authenticateToken, Middleware.requireAdmin, usersRouterForAdmin);
app.use('/api/app-config', Middleware.authenticateToken, appConfigRouter);

app.use(express.static(path.resolve(__dirname, '../bakemania-spa/dist/.')));

const httpsPort = parseInt(process.env.PORT!);

// /**
//  * **How to generate cert**
//  * @domain localhost 192.168.183.252
//  * `mkcert -key-file key.pem -cert-file cert.pem {domain}`
//  */
// const httpsServer = https.createServer({
//     key: fs.readFileSync(process.env.KEY_PATH ?? ""),
//     cert: fs.readFileSync(process.env.CERT_PATH ?? ""),
// }, app);

// httpsServer.listen(httpsPort, () => {
//     console.log(`HTTPS: https://${getLocalIP()}:${httpsPort}`);
//     console.log(`HTTPS: https://localhost:${httpsPort}`);
// });

// if (process.env.NODE_ENV === 'production') {
//     http.createServer((req, res) => {
//         res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
//         res.end();
//     }).listen(80, () => {
//         console.log(`HTTP: proxy to https://`);
//     });
// }

let wsHttpsServer: WebSocketServer;

if (process.env.NODE_ENV === 'production') {
    /**
     * Behind Nginx
     */
    const httpServer = http.createServer(app);
    httpServer.listen(3000, () => {
        console.log(`HTTP: http://${getLocalIP()}:${process.env.PORT}`);
        console.log(`HTTP: http://localhost:${process.env.PORT}`);
    });
    wsHttpsServer = new WebSocketServer({ server: httpServer })
} else {
    /**
     * **How to generate local cert**
     * @domain localhost 192.168.183.252
     * `mkcert -key-file key.pem -cert-file cert.pem {domain}`
     */
    const httpsServer = https.createServer({
        key: fs.readFileSync(process.env.KEY_PATH ?? ""),
        cert: fs.readFileSync(process.env.CERT_PATH ?? ""),
    }, app);

    httpsServer.listen(httpsPort, () => {
        console.log(`HTTPS: https://${getLocalIP()}:${httpsPort}`);
        console.log(`HTTPS: https://localhost:${httpsPort}`);
    });

    wsHttpsServer = new WebSocketServer({ server: httpsServer })
}

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

// const wsHttpsServer = new WebSocketServer({ server: httpsServer });

wsHttpsServer.on("connection", (ws, req) => {
    try {
        const [token, sessionId] = req.headers["sec-websocket-protocol"]?.split(', ') ?? [];
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!token || !JWT_SECRET) return null;

        jwt.verify(
            token,
            JWT_SECRET,
            async (err: any, user: any): Promise<void> => {
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