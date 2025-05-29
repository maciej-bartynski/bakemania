import request from 'supertest';
import app, { servers } from '@/app';
import usersDb from '@/services/DbService/instances/UsersDb';
import EmailService from '@/services/EmailService/EmailService';
import Logs from '@/services/LogService';
import UserRole from '@/services/DbService/instances/UsersDb.types';
import path from 'path';
import fsPromises from 'fs/promises';
import managersDb from '@/services/DbService/instances/ManagersDb';
import adminsDb from '@/services/DbService/instances/AdminsDb';
import appConfigDb from '@/services/DbService/instances/AppConfigDb';
import jwt from 'jsonwebtoken';

// Te same mocki co w poprzednich testach
jest.mock('ws', () => ({
    WebSocketServer: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        close: jest.fn()
    }))
}));

jest.mock('express-rate-limit', () => {
    const mockRateLimit = jest.fn().mockImplementation(() => (req: any, res: any, next: any) => next());
    return {
        rateLimit: mockRateLimit,
        __esModule: true,
        default: mockRateLimit
    };
});

const DB_DIRNAME = 'test-integration-auth-verify-email-db';
const DB_USERS_STORE = 'users';
const DB_MANAGERS_STORE = 'managers';
const DB_ADMINS_STORE = 'admins';
const DB_APPCONFIG_STORE = 'appconfig';
const DB_PATH = path.join(process.cwd(), DB_DIRNAME);
const LOG_DIRNAME = 'test-integration-auth-verify-email-logs';
const LOG_LOCATION_APP = 'test-integration-auth-verify-email-logs-app';
const LOG_LOCATION_WS = 'test-integration-auth-verify-email-logs-ws';
const LOG_LOCATION_EMAIL = 'test-integration-auth-verify-email-logs-email';
const LOG_LOCATION_CLIENT = 'test-integration-auth-verify-email-logs-client';
const LOG_PATH = path.join(process.cwd(), LOG_DIRNAME);

describe('GET /auth/verify-email', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await fsPromises.rm(LOG_PATH, { recursive: true, force: true });
        await fsPromises.rm(DB_PATH, { recursive: true, force: true });
        await fsPromises.mkdir(DB_PATH, { recursive: true });
        await fsPromises.mkdir(path.join(DB_PATH, DB_ADMINS_STORE), { recursive: true });
        await fsPromises.mkdir(path.join(DB_PATH, DB_MANAGERS_STORE), { recursive: true });
        await fsPromises.mkdir(path.join(DB_PATH, DB_USERS_STORE), { recursive: true });
        await fsPromises.mkdir(path.join(DB_PATH, DB_APPCONFIG_STORE), { recursive: true });
        await fsPromises.mkdir(LOG_PATH, { recursive: true });
        await fsPromises.mkdir(path.join(LOG_PATH, LOG_LOCATION_APP), { recursive: true });
        await fsPromises.mkdir(path.join(LOG_PATH, LOG_LOCATION_WS), { recursive: true });
        await fsPromises.mkdir(path.join(LOG_PATH, LOG_LOCATION_EMAIL), { recursive: true });
        await fsPromises.mkdir(path.join(LOG_PATH, LOG_LOCATION_CLIENT), { recursive: true });

        Logs.appLogs.__config({
            location: LOG_LOCATION_APP,
            logPath: LOG_PATH
        });

        Logs.wsLogs.__config({
            location: LOG_LOCATION_WS,
            logPath: LOG_PATH
        });

        Logs.emailLogs.__config({
            location: LOG_LOCATION_EMAIL,
            logPath: LOG_PATH
        });

        Logs.clientLogs.__config({
            location: LOG_LOCATION_CLIENT,
            logPath: LOG_PATH
        });

        usersDb.__config({
            dbStore: DB_USERS_STORE,
            path: DB_PATH,
            lock: {}
        });
        managersDb.__config({
            dbStore: DB_MANAGERS_STORE,
            path: DB_PATH,
            lock: {}
        });
        adminsDb.__config({
            dbStore: DB_ADMINS_STORE,
            path: DB_PATH,
            lock: {}
        });
        appConfigDb.__config({
            dbStore: DB_APPCONFIG_STORE,
            path: DB_PATH,
            lock: {}
        });

        await usersDb.__drop();
        await Logs.appLogs.__drop();
    });

    afterAll(async () => {
        await fsPromises.rm(DB_PATH, { recursive: true, force: true });
        await fsPromises.rm(LOG_PATH, { recursive: true, force: true });
        servers.http?.close();
        servers.https?.close();
        servers.ws?.close();
        servers.wss?.close();
    });

    it('powinien zweryfikować email użytkownika', async () => {
        // Przygotuj użytkownika
        const user = {
            _id: 'test-id',
            email: 'test@example.com',
            password: 'Test123!@#',
            role: UserRole.User,
            verification: { isVerified: false },
            agreements: true
        };
        await usersDb.setById(user._id, user);

        // Wygeneruj token weryfikacyjny
        const token = jwt.sign(
            { _id: user._id, stamp: 'test-stamp' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        const response = await request(app)
            .get('/api/auth/verify-email')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Sprawdź czy użytkownik został zweryfikowany
        const updatedUser = await usersDb.getById(user._id);
        expect(updatedUser?.verification.isVerified).toBe(true);
    });

    it('powinien zwrócić błąd gdy token jest nieprawidłowy', async () => {
        const response = await request(app)
            .get('/api/auth/verify-email')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
    });

    it('powinien zwrócić błąd gdy użytkownik nie istnieje', async () => {
        // Wygeneruj token dla nieistniejącego użytkownika
        const token = jwt.sign(
            { _id: 'non-existent-id', stamp: 'test-stamp' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        const response = await request(app)
            .get('/api/auth/verify-email')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
    });

    it('powinien zwrócić sukces gdy użytkownik jest już zweryfikowany', async () => {
        // Przygotuj już zweryfikowanego użytkownika
        const user = {
            _id: 'test-id',
            email: 'test@example.com',
            password: 'Test123!@#',
            role: UserRole.User,
            verification: { isVerified: true },
            agreements: true
        };
        await usersDb.setById(user._id, user);

        // Wygeneruj token weryfikacyjny
        const token = jwt.sign(
            { _id: user._id, stamp: 'test-stamp' },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        const response = await request(app)
            .get('/api/auth/verify-email')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
    });
});
