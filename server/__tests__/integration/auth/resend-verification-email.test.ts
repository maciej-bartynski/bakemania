import request from 'supertest';
import app, { serversToExportForTests } from '@/app';
import usersDb from '@/services/DbService/instances/UsersDb';
import EmailService from '@/services/EmailService/EmailService';
import Logs from '@/services/LogService';
import UserRole from '@/services/DbService/instances/UsersDb.types';
import path from 'path';
import fsPromises from 'fs/promises';
import managersDb from '@/services/DbService/instances/ManagersDb';
import adminsDb from '@/services/DbService/instances/AdminsDb';
import appConfigDb from '@/services/DbService/instances/AppConfigDb';

// Te same mocki co w register.test.ts
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

jest.mock('@/services/EmailService/EmailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));

const DB_DIRNAME = 'test-integration-auth-resend-verification-db';
const DB_USERS_STORE = 'users';
const DB_MANAGERS_STORE = 'managers';
const DB_ADMINS_STORE = 'admins';
const DB_APPCONFIG_STORE = 'appconfig';
const DB_PATH = path.join(process.cwd(), DB_DIRNAME);
const LOG_DIRNAME = 'test-integration-auth-resend-verification-logs';
const LOG_LOCATION_APP = 'test-integration-auth-resend-verification-logs-app';
const LOG_LOCATION_WS = 'test-integration-auth-resend-verification-logs-ws';
const LOG_LOCATION_EMAIL = 'test-integration-auth-resend-verification-logs-email';
const LOG_LOCATION_CLIENT = 'test-integration-auth-resend-verification-logs-client';
const LOG_PATH = path.join(process.cwd(), LOG_DIRNAME);

describe('POST /auth/resend-verification-email', () => {
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
        serversToExportForTests.http?.close();
        serversToExportForTests.ws?.close();
    });

    it('powinien wysłać nowy email weryfikacyjny', async () => {
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

        const response = await request(app)
            .post('/api/auth/resend-verification-email')
            .send({ email: user.email });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(EmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('powinien zwrócić błąd gdy użytkownik nie istnieje', async () => {
        const response = await request(app)
            .post('/api/auth/resend-verification-email')
            .send({ email: 'nonexistent@example.com' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Nie znaleziono użytkownika o podanym adresie email');
    });

    it('powinien zwrócić błąd gdy użytkownik jest już zweryfikowany', async () => {
        const user = {
            _id: 'test-id',
            email: 'test@example.com',
            password: 'Test123!@#',
            role: UserRole.User,
            verification: { isVerified: true },
            agreements: true
        };
        await usersDb.setById(user._id, user);

        const response = await request(app)
            .post('/api/auth/resend-verification-email')
            .send({ email: user.email });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Użytkownik jest już zweryfikowany');
    });
});
