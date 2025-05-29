import dotenv from 'dotenv';
import path from 'path';
import { rateLimit } from 'express-rate-limit'

if (process.env.NODE_ENV !== 'production') {
    const devEnvFile = path.resolve(__dirname, '../.env');
    dotenv.config({ path: devEnvFile });
} else {
    /**
     * Docker will populate envs.
     * See Makefile "start".
     */
}

import express from 'express';
import authRouter from './api/auth/router';
import userRouter from './api/user/router';
import Middleware from './lib/middleware';
import assistantRouter from './api/assistant/router';
import adminRouter from './api/admin/router';
import cors from 'cors';
import appConfigRouter from './api/appConfig/router';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { WebSocketServer } from "ws";
import jwt from 'jsonwebtoken';
import connections from './wsConnections';
import getLocalIP from './lib/getLocalIP';
import Logs from './services/LogService';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/api/ping', (req, res) => {
    res.status(204).send();
})

const limiter = rateLimit({
    message: "Too many requests from this IP, please try again later.",
    windowMs: 1, // 1 sec
    limit: 1, // Limit each IP to 1 requests per `window` (here, per 1 sec).
    standardHeaders: 'draft-8',
    legacyHeaders: false,
})

app.post('/api/client-logs', limiter, Middleware.authenticateToken, (req, res) => {
    Logs.appLogs.catchUnhandled('Client logs failed', () => {
        Logs.clientLogs.saveReport(req.body);
    });
    res.status(204).send();
});

app.use('/api/auth', authRouter);
app.use('/api/user', Middleware.authenticateToken, userRouter);
app.use('/api/assistant', Middleware.authenticateToken, Middleware.requireAssistant, assistantRouter);
app.use('/api/admin', Middleware.authenticateToken, Middleware.requireAdmin, adminRouter);
app.use('/api/app-config', Middleware.authenticateToken, appConfigRouter);

/**
 * Serve static files from bakemania-spa/dist/
 */

app.use(express.static(path.resolve(__dirname, '../bakemania-spa/dist/.')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../bakemania-spa/dist/index.html'));
});

let wsServer: WebSocketServer;

let servers: {
    http: http.Server | null,
    https: https.Server | null,
    ws: WebSocketServer | null,
    wss: WebSocketServer | null
} = {
    http: null,
    https: null,
    ws: null,
    wss: null
}

if (process.env.NODE_ENV === 'production') {
    /**
     * Behind Nginx
     */
    const httpPort = 3000;
    const httpServer = http.createServer(app);

    httpServer.listen(httpPort, () => {
        console.log(`http://${getLocalIP()}:${httpPort}`);
        console.log(`http://localhost:${httpPort}`);
    });

    wsServer = new WebSocketServer({ server: httpServer });

    servers.http = httpServer;
    servers.ws = wsServer;
} else {
    /**
     * **How to generate local cert**
     * @domain localhost 192.168.183.252
     * `mkcert -key-file key.pem -cert-file cert.pem {domain(s)}`
     */

    const httpsPort = process.env.PORT;
    const httpsServer = https.createServer({
        key: fs.readFileSync(process.env.KEY_PATH ?? ""),
        cert: fs.readFileSync(process.env.CERT_PATH ?? ""),
    }, app);

    httpsServer.listen(httpsPort, () => {
        console.log(`https://${getLocalIP()}:${httpsPort}`);
        console.log(`https://localhost:${httpsPort}`);
    });

    wsServer = new WebSocketServer({ server: httpsServer });

    servers.https = httpsServer;
    servers.wss = wsServer;
}

wsServer.on("connection", (ws, req) => {
    Logs.wsLogs.catchUnhandled('WsServer connection error', () => {

        const [token, sessionId] = req.headers["sec-websocket-protocol"]?.split(', ') ?? [];
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!token) {
            Logs.wsLogs.report('Missing token', (setDetails) => {
                setDetails('What happend', 'Missing access token');
            });
            ws.close();
            return null;
        }

        if (!JWT_SECRET) {
            Logs.wsLogs.report('Missing JWT_SECRET', (setDetails) => {
                setDetails('JWT_SECRET value', JWT_SECRET);
            });
            ws.close();
            return null;
        }

        jwt.verify(
            token,
            JWT_SECRET,
            async (err: any, user: any): Promise<void> => {

                if (err) {
                    Logs.wsLogs.report('JWT verification failed [1]', (setDetails) => {
                        setDetails('Where', 'JWT vefification');
                        setDetails('What happend', err);
                        if (user) {
                            setDetails('User', user);
                        }
                    });
                    return;
                }

                if (user) {
                    const userId = user._id;
                    if (!userId) {
                        Logs.wsLogs.report('JWT verification failed [2]', (setDetails) => {
                            setDetails('Where', 'JWT vefification');
                            setDetails('What happend', 'Missing user ID');
                            setDetails('User', user);
                        });
                        return;
                    }

                    connections.wss.set(userId, ws);

                    ws.on("message", (message) => {
                        ws.send('WS initial ping from server');
                    });

                    ws.on('close', () => {
                        Logs.wsLogs.catchUnhandled('WebSocket error on close', () => {
                            if (!connections.wss.has(userId)) {
                                return;
                            }
                            connections.wss.delete(userId);
                        })
                    });
                }
            });

    });
});

export default app;

export { servers };