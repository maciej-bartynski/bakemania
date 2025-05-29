import path from 'path';
import fsPromises from 'fs/promises';
import LogsModule, { LOGS_DIRNAME } from '@/services/LogService';
import fs from 'fs';

const TEST_LOGS_PATH = path.resolve(process.cwd(), LOGS_DIRNAME);

describe('LogService Unit Tests', () => {

    const appLogs = new LogsModule.Service({ location: LogsModule.LogLocations.App });
    appLogs.__config({ location: LogsModule.LogLocations.App, logPath: TEST_LOGS_PATH });

    beforeEach(async () => {
        try {
            if (fs.existsSync(TEST_LOGS_PATH)) {
                await fsPromises.rm(TEST_LOGS_PATH, { recursive: true, force: true });
            }
            await fsPromises.mkdir(TEST_LOGS_PATH, { recursive: true });
            await fsPromises.mkdir(path.join(TEST_LOGS_PATH, LogsModule.LogLocations.App), { recursive: true });
        } catch (error) {
            console.error('Error cleaning test logs:', error);
            throw error;
        }
    });

    afterAll(async () => {
        if (fs.existsSync(TEST_LOGS_PATH)) {
            await fsPromises.rm(TEST_LOGS_PATH, { recursive: true, force: true });
        }
    });

    describe('catchUnhandled', () => {
        it('powinien zwrócić wynik gdy nie ma błędu', async () => {
            const result = await appLogs.catchUnhandled(
                'Locator',
                async () => 'success'
            );
            expect(result).toBe('success');
        });

        it('powinien zalogować błąd gdy wystąpi wyjątek', async () => {
            const error = new Error('Test error');
            await appLogs.catchUnhandled(
                'App locator',
                async () => {
                    throw error;
                }
            );

            const log = await appLogs.getLatestLog('app');

            expect(log).not.toBeNull();
            expect(log?.message).toBe('App locator');
            expect(log?.details['What happend']).toBe('Test error');

        });

        it('powinien użyć fallbacka gdy callback zawiedzie', async () => {
            const result = await appLogs.catchUnhandled(
                'Test app locator',
                async () => {
                    throw new Error('Test error');
                },
                async () => 'fallback value'
            );

            expect(result).toBe('fallback value');
            const log = await appLogs.getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe('Test app locator');
            expect(log?.details['What happend']).toBe('Test error');
        });
    });

    describe('report', () => {
        it('powinien utworzyć log z poprawną strukturą', async () => {
            const message = 'This is some locator';
            const details = { test: 'detail', field: 123, is: true };

            await appLogs.report(message, (setDetails) => {
                Object.entries(details).forEach(([key, value]) => {
                    setDetails(key, value);
                });
            });

            const log = await appLogs.getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe(message);
            expect(log?.details.test).toBe(details.test);
            expect(log?.details.field).toBe(details.field);
            expect(log?.details.is).toBe(details.is);
            expect(log?.timestamp).toBeDefined();
        });

        it('powinien obsłużyć różne typy wiadomości', async () => {
            const error = new Error('Test error');
            await appLogs.report(error.message, (setDetails) => {
                setDetails('Error', error.stack);
            });

            const log = await appLogs.getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe('Test error');
            expect(log?.details['Error']).toBe(error.stack);
        });
    });

    describe('saveReport', () => {
        it('powinien utworzyć plik logu z poprawną nazwą i zawartością', async () => {
            const message = 'Test message';
            const details = { test: 'detail' };

            await appLogs.saveReport({
                message,
                details: Object.fromEntries(
                    Object.entries(details).map(([key, value]) => [key, JSON.stringify(value)])
                )
            });

            const files = await fsPromises.readdir(path.join(TEST_LOGS_PATH, 'app'));
            expect(files.length).toBe(1);
            expect(files[0]).toMatch(/^\d{13}__[A-Z][a-z]{2}\d{2}-\d{4}__\d{2}-\d{2}-\d{2}\.json$/);
            const log = await appLogs.getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe(message);
            expect(log?.details.test).toBe(JSON.stringify(details.test));
            expect(log?.timestamp).toBeDefined();
        });
    });
}); 