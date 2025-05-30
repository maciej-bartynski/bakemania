import request from 'supertest';
import app, { serversToExportForTests } from '@/app';
import usersDb from '@/services/DbService/instances/UsersDb';
import managersDb from '@/services/DbService/instances/ManagersDb';
import adminsDb from '@/services/DbService/instances/AdminsDb';
import Logs from '@/services/LogService';
import path from 'path';
import fsPromises from 'fs/promises';
import UserRole from '@/services/DbService/instances/UsersDb.types';
import { ManagerModel } from '@/services/DbService/instances/ManagersDb.types';
import { AdminModel } from '@/services/DbService/instances/AdminsDb.types';
import jwt from 'jsonwebtoken';

// Mock dla WebSocket
const mockBroadcastToUser = jest.fn();
jest.mock('@/wsConnections', () => ({
    broadcastToUser: (...args: any[]) => mockBroadcastToUser(...args)
}));

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

const DB_DIRNAME = 'test-integration-assistant-stamps-change-force-db';
const DB_USERS_STORE = 'users';
const DB_MANAGERS_STORE = 'managers';
const DB_ADMINS_STORE = 'admins';
const DB_PATH = path.join(process.cwd(), DB_DIRNAME);
const LOG_DIRNAME = 'test-integration-assistant-stamps-change-force-logs';
const LOG_LOCATION_APP = 'test-integration-assistant-stamps-change-force-logs-app';
const LOG_LOCATION_WS = 'test-integration-assistant-stamps-change-force-logs-ws';
const LOG_LOCATION_CLIENT = 'test-integration-assistant-stamps-change-force-logs-client';
const LOG_PATH = path.join(process.cwd(), LOG_DIRNAME);

describe('POST /assistant/stamps/change-force', () => {
    const testUser = {
        _id: 'test-user-id',
        email: 'test@example.com',
        password: 'Test123!@#',
        role: UserRole.User,
        verification: { isVerified: true },
        agreements: true,
        stamps: {
            amount: 0,
            history: []
        },
        card: {
            hash: '123456789',
            createdAt: Date.now()
        }
    };

    const testAssistant = {
        _id: 'test-assistant-id',
        email: 'assistant@example.com',
        password: 'Test123!@#',
        role: UserRole.Manager,
        verification: { isVerified: true },
        agreements: true,
        transactionsHistory: []
    };

    let assistantToken: string;

    beforeEach(async () => {
        jest.clearAllMocks();
        await fsPromises.rm(LOG_PATH, { recursive: true, force: true });
        await fsPromises.rm(DB_PATH, { recursive: true, force: true });
        await fsPromises.mkdir(DB_PATH, { recursive: true });
        await fsPromises.mkdir(path.join(DB_PATH, DB_MANAGERS_STORE), { recursive: true });
        await fsPromises.mkdir(path.join(DB_PATH, DB_USERS_STORE), { recursive: true });
        await fsPromises.mkdir(path.join(DB_PATH, DB_ADMINS_STORE), { recursive: true });
        await fsPromises.mkdir(LOG_PATH, { recursive: true });
        await fsPromises.mkdir(path.join(LOG_PATH, LOG_LOCATION_APP), { recursive: true });
        await fsPromises.mkdir(path.join(LOG_PATH, LOG_LOCATION_WS), { recursive: true });
        await fsPromises.mkdir(path.join(LOG_PATH, LOG_LOCATION_CLIENT), { recursive: true });

        Logs.appLogs.__config({
            location: LOG_LOCATION_APP,
            logPath: LOG_PATH
        });

        Logs.wsLogs.__config({
            location: LOG_LOCATION_WS,
            logPath: LOG_PATH
        });

        Logs.clientLogs.__config({
            location: LOG_LOCATION_CLIENT,
            logPath: LOG_PATH
        });

        managersDb.__config({
            dbStore: DB_MANAGERS_STORE,
            path: DB_PATH,
            lock: {}
        });
        usersDb.__config({
            dbStore: DB_USERS_STORE,
            path: DB_PATH,
            lock: {}
        });
        adminsDb.__config({
            dbStore: DB_ADMINS_STORE,
            path: DB_PATH,
            lock: {}
        });

        await usersDb.__drop();
        await managersDb.__drop();
        await adminsDb.__drop();
        await Logs.appLogs.__drop();

        // Przygotowanie testowych danych
        await usersDb.setById(testUser._id, testUser);
        await managersDb.setById(testAssistant._id, testAssistant);

        // Generowanie tokenu dla asystenta
        assistantToken = jwt.sign(
            { _id: testAssistant._id },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await fsPromises.rm(DB_PATH, { recursive: true, force: true });
        await fsPromises.rm(LOG_PATH, { recursive: true, force: true });
        serversToExportForTests.http?.close();
        serversToExportForTests.ws?.close();
    });

    it('powinien dodać pieczątki użytkownikowi i zaktualizować historię', async () => {
        const amount = 5;
        const response = await request(app)
            .post('/api/assistant/stamps/change-force')
            .set('Authorization', `Bearer ${assistantToken}`)
            .send({
                userId: testUser._id,
                amount,
                assistantId: testAssistant._id
            });

        expect(response.status).toBe(200);
        expect(response.body.stamps.amount).toBe(amount);

        // Sprawdź stan użytkownika
        const updatedUser = await usersDb.getById(testUser._id);
        expect(updatedUser?.stamps.amount).toBe(amount);
        expect(updatedUser?.stamps.history).toHaveLength(1);
        expect(updatedUser?.stamps.history[0].by).toBe(amount);
        expect(updatedUser?.stamps.history[0].assistantId).toBe(testAssistant._id);

        // Sprawdź stan asystenta
        const updatedAssistant = await managersDb.getById<ManagerModel>(testAssistant._id);
        expect(updatedAssistant?.transactionsHistory).toHaveLength(1);
        expect(updatedAssistant?.transactionsHistory[0].by).toBe(amount);
        expect(updatedAssistant?.transactionsHistory[0].userId).toBe(testUser._id);

        // Sprawdź czy WebSocket został wywołany
        expect(mockBroadcastToUser).toHaveBeenCalledWith(testUser._id, 'stamps');

        // Sprawdź czy nie ma logów błędów
        const logs = await Logs.appLogs.getLatestLog('app');
        expect(logs).toBeNull();
    });

    it('powinien odjąć pieczątki użytkownikowi i zaktualizować historię', async () => {
        // Najpierw dodaj pieczątki
        await request(app)
            .post('/api/assistant/stamps/change-force')
            .set('Authorization', `Bearer ${assistantToken}`)
            .send({
                userId: testUser._id,
                amount: 10,
                assistantId: testAssistant._id
            });

        // Teraz odejmij pieczątki
        const amount = -3;
        const response = await request(app)
            .post('/api/assistant/stamps/change-force')
            .set('Authorization', `Bearer ${assistantToken}`)
            .send({
                userId: testUser._id,
                amount,
                assistantId: testAssistant._id
            });

        expect(response.status).toBe(200);
        expect(response.body.stamps.amount).toBe(7); // 10 - 3 = 7

        // Sprawdź stan użytkownika
        const updatedUser = await usersDb.getById(testUser._id);
        expect(updatedUser?.stamps.amount).toBe(7);
        expect(updatedUser?.stamps.history).toHaveLength(2);
        expect(updatedUser?.stamps.history[1].by).toBe(amount);
        expect(updatedUser?.stamps.history[1].assistantId).toBe(testAssistant._id);

        // Sprawdź stan asystenta
        const updatedAssistant = await managersDb.getById<ManagerModel>(testAssistant._id);
        expect(updatedAssistant?.transactionsHistory).toHaveLength(2);
        expect(updatedAssistant?.transactionsHistory[1].by).toBe(amount);
        expect(updatedAssistant?.transactionsHistory[1].userId).toBe(testUser._id);

        // Sprawdź czy WebSocket został wywołany
        expect(mockBroadcastToUser).toHaveBeenCalledWith(testUser._id, 'stamps');

        // Sprawdź czy nie ma logów błędów
        const logs = await Logs.appLogs.getLatestLog('app');
        expect(logs).toBeNull();
    });

    it('powinien poprawnie obsłużyć wielokrotne transakcje między różnymi typami użytkowników', async () => {
        // Przygotowanie danych testowych
        const users = Array.from({ length: 10 }, (_, i) => ({
            _id: `user-${i}`,
            email: `user${i}@example.com`,
            password: 'Test123!@#',
            role: UserRole.User,
            verification: { isVerified: true },
            agreements: true,
            stamps: {
                amount: 0,
                history: []
            }
        }));

        const managers = Array.from({ length: 3 }, (_, i) => ({
            _id: `manager-${i}`,
            email: `manager${i}@example.com`,
            password: 'Test123!@#',
            role: UserRole.Manager,
            verification: { isVerified: true },
            agreements: true,
            transactionsHistory: []
        }));

        const admins = Array.from({ length: 2 }, (_, i) => ({
            _id: `admin-${i}`,
            email: `admin${i}@example.com`,
            password: 'Test123!@#',
            role: UserRole.Admin,
            verification: { isVerified: true },
            agreements: true,
            transactionsHistory: []
        }));

        // Zapisywanie wszystkich użytkowników w bazie
        for (const user of users) {
            await usersDb.setById(user._id, user);
        }
        for (const manager of managers) {
            await managersDb.setById(manager._id, manager);
        }
        for (const admin of admins) {
            await adminsDb.setById(admin._id, admin);
        }

        // Generowanie tokenów dla asystentów
        const assistantTokens = {
            managers: managers.map(manager =>
                jwt.sign(
                    { _id: manager._id },
                    process.env.JWT_SECRET || 'test-secret',
                    { expiresIn: '1h' }
                )
            ),
            admins: admins.map(admin =>
                jwt.sign(
                    { _id: admin._id },
                    process.env.JWT_SECRET || 'test-secret',
                    { expiresIn: '1h' }
                )
            )
        };

        // Symulacja transakcji
        const transactions = [
            { assistantId: 'manager-0', userId: 'user-0', amount: 5 },
            { assistantId: 'admin-0', userId: 'user-1', amount: 3 },
            { assistantId: 'manager-1', userId: 'user-2', amount: 7 },
            { assistantId: 'admin-1', userId: 'user-3', amount: 4 },
            { assistantId: 'manager-2', userId: 'user-4', amount: 6 },
            { assistantId: 'manager-0', userId: 'user-5', amount: 2 },
            { assistantId: 'admin-0', userId: 'user-6', amount: 8 },
            { assistantId: 'manager-1', userId: 'user-7', amount: 1 },
            { assistantId: 'admin-1', userId: 'user-8', amount: 9 },
            { assistantId: 'manager-2', userId: 'user-9', amount: 3 },
            // Odejmowanie pieczątek
            { assistantId: 'manager-0', userId: 'user-0', amount: -2 },
            { assistantId: 'admin-0', userId: 'user-1', amount: -1 },
            { assistantId: 'manager-1', userId: 'user-2', amount: -3 },
            { assistantId: 'admin-1', userId: 'user-3', amount: -2 },
            { assistantId: 'manager-2', userId: 'user-4', amount: -4 }
        ];

        // Wykonanie transakcji
        for (const transaction of transactions) {
            const isManager = transaction.assistantId.startsWith('manager');
            const tokenIndex = parseInt(transaction.assistantId.split('-')[1]);
            const token = isManager ?
                assistantTokens.managers[tokenIndex] :
                assistantTokens.admins[tokenIndex];

            await request(app)
                .post('/api/assistant/stamps/change-force')
                .set('Authorization', `Bearer ${token}`)
                .send(transaction);
        }

        // Sprawdzenie stanu końcowego użytkowników
        for (const user of users) {
            const updatedUser = await usersDb.getById(user._id);
            expect(updatedUser).toBeDefined();

            // Obliczanie oczekiwanej sumy pieczątek
            const expectedAmount = transactions
                .filter(t => t.userId === user._id)
                .reduce((sum, t) => sum + t.amount, 0);

            expect(updatedUser?.stamps.amount).toBe(expectedAmount);
            expect(updatedUser?.stamps.history.length).toBe(
                transactions.filter(t => t.userId === user._id).length
            );
        }

        // Sprawdzenie historii transakcji asystentów
        for (const manager of managers) {
            const updatedManager = await managersDb.getById<ManagerModel>(manager._id);
            expect(updatedManager).toBeDefined();

            const managerTransactions = transactions.filter(t => t.assistantId === manager._id);
            expect(updatedManager?.transactionsHistory.length).toBe(managerTransactions.length);

            // Sprawdzenie czy każda transakcja w historii jest poprawna
            for (let i = 0; i < managerTransactions.length; i++) {
                const transaction = managerTransactions[i];
                const historyEntry = updatedManager?.transactionsHistory[i];
                expect(historyEntry?.by).toBe(transaction.amount);
                expect(historyEntry?.userId).toBe(transaction.userId);
            }
        }

        for (const admin of admins) {
            const updatedAdmin = await adminsDb.getById<AdminModel>(admin._id);
            expect(updatedAdmin).toBeDefined();

            const adminTransactions = transactions.filter(t => t.assistantId === admin._id);
            expect(updatedAdmin?.transactionsHistory.length).toBe(adminTransactions.length);

            // Sprawdzenie czy każda transakcja w historii jest poprawna
            for (let i = 0; i < adminTransactions.length; i++) {
                const transaction = adminTransactions[i];
                const historyEntry = updatedAdmin?.transactionsHistory[i];
                expect(historyEntry?.by).toBe(transaction.amount);
                expect(historyEntry?.userId).toBe(transaction.userId);
            }
        }

        // Sprawdzenie czy nie ma logów błędów
        const logs = await Logs.appLogs.getLatestLog('app');
        expect(logs).toBeNull();
    });

    it('powinien poprawnie obsłużyć historię transakcji przekraczającą próg 50 wpisów', async () => {
        // Przygotowanie danych testowych
        const users = Array.from({ length: 10 }, (_, i) => ({
            _id: `user-${i}`,
            email: `user${i}@example.com`,
            password: 'Test123!@#',
            role: UserRole.User,
            verification: { isVerified: true },
            agreements: true,
            stamps: {
                amount: 0,
                history: []
            }
        }));

        const managers = Array.from({ length: 2 }, (_, i) => ({
            _id: `manager-${i}`,
            email: `manager${i}@example.com`,
            password: 'Test123!@#',
            role: UserRole.Manager,
            verification: { isVerified: true },
            agreements: true,
            transactionsHistory: []
        }));

        const admin = {
            _id: 'admin-0',
            email: 'admin0@example.com',
            password: 'Test123!@#',
            role: UserRole.Admin,
            verification: { isVerified: true },
            agreements: true,
            transactionsHistory: []
        };

        // Zapisywanie wszystkich użytkowników w bazie
        for (const user of users) {
            await usersDb.setById(user._id, user);
        }
        for (const manager of managers) {
            await managersDb.setById(manager._id, manager);
        }
        await adminsDb.setById(admin._id, admin);

        // Generowanie tokenów dla asystentów
        const assistantTokens = {
            managers: managers.map(manager =>
                jwt.sign(
                    { _id: manager._id },
                    process.env.JWT_SECRET || 'test-secret',
                    { expiresIn: '1h' }
                )
            ),
            admin: jwt.sign(
                { _id: admin._id },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '1h' }
            )
        };

        // Symulacja transakcji - każdy użytkownik dostanie 60 transakcji (10 ponad limit)
        const transactions = [];

        // Funkcja pomocnicza do generowania losowej kwoty
        const getRandomAmount = () => {
            const amounts = [-5, -3, -2, -1, 1, 2, 3, 5];
            return amounts[Math.floor(Math.random() * amounts.length)];
        };

        // Dla każdego użytkownika generujemy 60 transakcji od różnych asystentów
        for (let i = 0; i < 10; i++) {
            const userId = `user-${i}`;
            let currentBalance = 0;

            for (let j = 0; j < 60; j++) {
                // Wybieramy losowego asystenta
                let assistantId;
                if (j < 20) {
                    assistantId = 'manager-0';
                } else if (j < 40) {
                    assistantId = 'manager-1';
                } else {
                    assistantId = 'admin-0';
                }

                // Generujemy kwotę, ale dbamy o to, żeby saldo nie było ujemne
                let amount;
                do {
                    amount = getRandomAmount();
                } while (currentBalance + amount < 0);

                currentBalance += amount;

                transactions.push({
                    assistantId,
                    userId,
                    amount
                });
            }
        }

        // Wykonanie transakcji
        for (const transaction of transactions) {
            const isManager = transaction.assistantId.startsWith('manager');
            const tokenIndex = parseInt(transaction.assistantId.split('-')[1]);
            const token = isManager ?
                assistantTokens.managers[tokenIndex] :
                assistantTokens.admin;

            await request(app)
                .post('/api/assistant/stamps/change-force')
                .set('Authorization', `Bearer ${token}`)
                .send(transaction);
        }

        // Sprawdzenie stanu końcowego użytkowników
        for (const user of users) {
            const updatedUser = await usersDb.getById(user._id);
            expect(updatedUser).toBeDefined();

            // Sprawdzenie czy liczba wpisów w historii nie przekracza 50
            expect(updatedUser?.stamps.history.length).toBe(50);

            // Sprawdzenie czy ostatni wpis zawiera poprawny balans
            const lastEntry = updatedUser?.stamps.history[updatedUser.stamps.history.length - 1];
            expect(lastEntry?.balance).toBe(updatedUser?.stamps.amount);

            // Sprawdzenie czy suma pieczątek jest poprawna (nieujemna)
            expect(updatedUser?.stamps.amount).toBeGreaterThanOrEqual(0);
        }

        // Sprawdzenie historii transakcji asystentów
        for (const manager of managers) {
            const updatedManager = await managersDb.getById<ManagerModel>(manager._id);
            expect(updatedManager).toBeDefined();

            // Sprawdzenie czy liczba wpisów w historii nie przekracza 50
            expect(updatedManager?.transactionsHistory.length).toBe(50);

            // Sprawdzenie czy ostatnie wpisy są poprawnie zachowane
            const lastEntries = updatedManager?.transactionsHistory.slice(-5);
            for (const entry of lastEntries || []) {
                expect(entry.balance).toBeGreaterThanOrEqual(0);
            }
        }

        // Sprawdzenie historii transakcji admina
        const updatedAdmin = await adminsDb.getById<AdminModel>(admin._id);
        expect(updatedAdmin).toBeDefined();

        // Sprawdzenie czy liczba wpisów w historii nie przekracza 50
        expect(updatedAdmin?.transactionsHistory.length).toBe(50);

        // Sprawdzenie czy ostatnie wpisy są poprawnie zachowane
        const lastEntries = updatedAdmin?.transactionsHistory.slice(-5);
        for (const entry of lastEntries || []) {
            expect(entry.balance).toBeGreaterThanOrEqual(0);
        }

        // Sprawdzenie czy nie ma logów błędów
        const logs = await Logs.appLogs.getLatestLog('app');
        expect(logs).toBeNull();
    });

    it('nie powinien pozwolić użytkownikowi na zmianę pieczątek innemu użytkownikowi', async () => {
        // Przygotowanie drugiego użytkownika
        const secondUser = {
            _id: 'test-user-2-id',
            email: 'test2@example.com',
            password: 'Test123!@#',
            role: UserRole.User,
            verification: { isVerified: true },
            agreements: true,
            stamps: {
                amount: 0,
                history: []
            }
        };
        await usersDb.setById(secondUser._id, secondUser);

        // Generowanie tokenu dla pierwszego użytkownika
        const userToken = jwt.sign(
            { _id: testUser._id },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        const response = await request(app)
            .post('/api/assistant/stamps/change-force')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userId: secondUser._id,
                amount: 5,
                assistantId: testUser._id
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Wymagane są uprawnienia pracownika.');

        // Sprawdzenie czy stan użytkownika nie został zmieniony
        const updatedUser = await usersDb.getById(secondUser._id);
        expect(updatedUser?.stamps.amount).toBe(0);
        expect(updatedUser?.stamps.history).toHaveLength(0);
    });

    it('nie powinien pozwolić użytkownikowi na zmianę swoich własnych pieczątek', async () => {
        // Generowanie tokenu dla użytkownika
        const userToken = jwt.sign(
            { _id: testUser._id },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );

        const response = await request(app)
            .post('/api/assistant/stamps/change-force')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                userId: testUser._id,
                amount: 5,
                assistantId: testUser._id
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Wymagane są uprawnienia pracownika.');

        // Sprawdzenie czy stan użytkownika nie został zmieniony
        const updatedUser = await usersDb.getById(testUser._id);
        expect(updatedUser?.stamps.amount).toBe(0);
        expect(updatedUser?.stamps.history).toHaveLength(0);
    });

    it('nie powinien pozwolić użytkownikowi na zmianę pieczątek bez tokenu', async () => {
        const response = await request(app)
            .post('/api/assistant/stamps/change-force')
            .send({
                userId: testUser._id,
                amount: 5,
                assistantId: testUser._id
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Brak tokenu.');

        // Sprawdzenie czy stan użytkownika nie został zmieniony
        const updatedUser = await usersDb.getById(testUser._id);
        expect(updatedUser?.stamps.amount).toBe(0);
        expect(updatedUser?.stamps.history).toHaveLength(0);
    });
});
