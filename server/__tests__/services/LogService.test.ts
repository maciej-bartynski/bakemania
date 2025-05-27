import path from 'path';
import fsPromises from 'fs/promises';
import Logs from '../../services/LogService';
import { cleanTestLogs, getLatestLog, TEST_LOGS_PATH } from '../setup-helpers';

describe('LogService Unit Tests', () => {

    beforeEach(async () => {
        await cleanTestLogs()
    });

    afterEach(async () => {
        await cleanTestLogs()
    });

    describe('catchUnhandled', () => {
        it('powinien zwrócić wynik gdy nie ma błędu', async () => {
            const result = await Logs.appLogs.catchUnhandled(
                'Locator',
                async () => 'success'
            );
            expect(result).toBe('success');
        });

        it('powinien zalogować błąd gdy wystąpi wyjątek', async () => {
            const error = new Error('Test error');
            await Logs.appLogs.catchUnhandled(
                'App locator',
                async () => {
                    throw error;
                }
            );

            const log = await getLatestLog('app');

            expect(log).not.toBeNull();
            expect(log?.message).toBe('App locator');
            expect(log?.details['What happend']).toBe('Test error');

        });

        it('powinien użyć fallbacka gdy callback zawiedzie', async () => {
            const result = await Logs.appLogs.catchUnhandled(
                'Test app locator',
                async () => {
                    throw new Error('Test error');
                },
                async () => 'fallback value'
            );

            expect(result).toBe('fallback value');
            const log = await getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe('Test app locator');
            expect(log?.details['What happend']).toBe('Test error');
        });
    });

    describe('report', () => {
        it('powinien utworzyć log z poprawną strukturą', async () => {
            const message = 'This is some locator';
            const details = { test: 'detail', field: 123, is: true };

            await Logs.appLogs.report(message, (setDetails) => {
                Object.entries(details).forEach(([key, value]) => {
                    setDetails(key, value);
                });
            });

            const log = await getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe(message);
            expect(log?.details.test).toBe(details.test);
            expect(log?.details.field).toBe(details.field);
            expect(log?.details.is).toBe(details.is);
            expect(log?.timestamp).toBeDefined();
        });

        it('powinien obsłużyć różne typy wiadomości', async () => {
            const error = new Error('Test error');
            await Logs.appLogs.report(error.message, (setDetails) => {
                setDetails('Error', error.stack);
            });

            const log = await getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe('Test error');
            expect(log?.details['Error']).toBe(error.stack);
        });
    });

    describe('saveReport', () => {
        it('powinien utworzyć plik logu z poprawną nazwą i zawartością', async () => {
            const message = 'Test message';
            const details = { test: 'detail' };

            await Logs.appLogs.saveReport({
                message,
                details: Object.fromEntries(
                    Object.entries(details).map(([key, value]) => [key, JSON.stringify(value)])
                )
            });

            const files = await fsPromises.readdir(path.join(TEST_LOGS_PATH, 'app'));
            expect(files.length).toBe(1);
            expect(files[0]).toMatch(/^\d{2}-\d{2}-\d{4}_\d{2}:\d{2}:\d{2}\.json$/);
            const log = await getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe(message);
            expect(log?.details.test).toBe(JSON.stringify(details.test));
            expect(log?.timestamp).toBeDefined();
        });
    });
}); 