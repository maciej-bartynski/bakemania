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

jest.mock('ws', () => {
    return {
        WebSocketServer: jest.fn().mockImplementation((config: any) => {
            return ({
                on: jest.fn(),
                close: jest.fn()
            });
        })
    }
});

// Mock dla express-rate-limit
jest.mock('express-rate-limit', () => {
    const mockRateLimit = jest.fn().mockImplementation((config) => {
        return (req: any, res: any, next: any) => {
            next();
        };
    });

    return {
        rateLimit: mockRateLimit,
        __esModule: true,
        default: mockRateLimit
    };
});
jest.mock('@/services/EmailService/EmailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));

// Mock dla fetch (reCAPTCHA)
global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true })
});

const DB_DIRNAME = 'test-integration-auth-register-db';
const DB_USERS_STORE = 'users';
const DB_MANAGERS_STORE = 'managers';
const DB_ADMINS_STORE = 'admins';
const DB_APPCONFIG_STORE = 'appconfig';
const DB_PATH = path.join(process.cwd(), DB_DIRNAME);
const LOG_DIRNAME = 'test-integration-auth-register-logs';
const LOG_LOCATION = 'test-integration-auth-register-logs-app';
const LOG_PATH = path.join(process.cwd(), LOG_DIRNAME);

Logs.appLogs.__config({
    location: LOG_LOCATION,
    logPath: LOG_PATH
});

describe('POST /auth/register', () => {
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
        await fsPromises.mkdir(path.join(LOG_PATH, LOG_LOCATION), { recursive: true });

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

    it('fake test', () => {
        expect(true).toBe(true);
    });

    it('powinien zarejestrować nowego użytkownika', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'Test123!@#',
            captchaToken: 'fake-captcha-token',
            agreements: true
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');

        // Sprawdź czy użytkownik został zapisany w bazie
        const savedUser = await usersDb.getById(response.body.id);
        expect(savedUser).toBeDefined();
        expect(savedUser?.email).toBe(userData.email);
        expect(savedUser?.role).toBe(UserRole.User);
        expect(savedUser?.verification.isVerified).toBe(false);

        // Sprawdź czy email został wysłany
        expect(EmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('powinien zwrócić błąd gdy email już istnieje', async () => {
        // Najpierw utwórz użytkownika
        const existingUser = {
            _id: 'test-id',
            email: 'existing@example.com',
            password: 'Test123!@#',
            role: UserRole.User,
            verification: { isVerified: false },
            agreements: true
        };
        await usersDb.setById(existingUser._id, existingUser);

        // Próbuj zarejestrować użytkownika z tym samym emailem
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'existing@example.com',
                password: 'Test123!@#',
                captchaToken: 'fake-captcha-token',
                agreements: true
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Ten adres email jest już zajęty.');
    });

    it('powinien zwrócić błąd gdy reCAPTCHA nie przejdzie', async () => {
        // Mock nieudanej weryfikacji reCAPTCHA
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ success: false })
        });

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Test123!@#',
                captchaToken: 'invalid-token',
                agreements: true
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Weryfikacja reCAPTCHA nie powiodła się');
    });

    it('powinien zalogować błąd gdy wystąpi problem z bazą danych', async () => {
        // Mock błędu bazy danych
        jest.spyOn(usersDb, 'setById').mockRejectedValueOnce(new Error('DB Error'));

        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Test123!@#',
                captchaToken: 'fake-captcha-token',
                agreements: true
            });

        expect(response.status).toBe(500);

        // Sprawdź czy błąd został zalogowany
        const logs = await Logs.appLogs.getLatestLog('app');
        expect(logs).toBeDefined();
        expect(logs?.message).toBe('Handler "/register" error');
    });
});
