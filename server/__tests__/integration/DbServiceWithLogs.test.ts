import path from 'path';
import DbService from '../../services/DbService/DbService';
import LogsModule from '@/services/LogService';
import fsPromises from 'fs/promises';
import fs from 'fs';
import * as uuid from 'uuid';

describe('DbService with Logs Integration', () => {
    const DB_STORE = 'db-service-with-logs-test-storename';
    const DB_DIRNAME = 'db-service-with-logs-test-dirname';
    const LOGS_DIRNAME = 'db-service-with-logs-test-logs-dirname';
    const LOGS_STORE = 'db-service-with-logs-test-logs-storename';
    let dbService: DbService;

    beforeEach(async () => {
        dbService = new DbService({ dbStore: DB_STORE as any });
        dbService.__config({
            dbStore: DB_STORE,
            path: DB_DIRNAME,
            lock: {},
        });
        LogsModule.appLogs.__config({
            location: LOGS_STORE,
            logPath: path.join(process.cwd(), LOGS_DIRNAME),
        });
    });

    afterEach(async () => {
        await dbService.__drop();
        await LogsModule.appLogs.__drop();
    });

    afterAll(async () => {
        try {
            await fsPromises.rm(path.join(process.cwd(), LOGS_DIRNAME), { recursive: true, force: true });
            await fsPromises.rm(path.join(process.cwd(), DB_DIRNAME), { recursive: true, force: true });
        } catch (e) {
            console.error(e);
        }
    });

    it('powinien zalogować błąd przy próbie aktualizacji nieistniejącego pliku', async () => {
        await dbService.updateById('random-id-never-created', { name: 'Test' });
        const log = await LogsModule.appLogs.getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on updateById');
        expect(log?.details['What happend']).toContain('ENOENT');
    });

    it('powinien zalogować błąd przy próbie odczytu uszkodzonego pliku (przypadek 1)', async () => {
        const testId = uuid.v4();
        const filePath = path.join(dbService.route, `${testId}.json`);
        await fsPromises.writeFile(filePath, 'invalid json');
        expect(fs.existsSync(filePath)).toBe(true);
        const result = await dbService.getById(testId);
        expect(result).toBeNull();
        const log = await LogsModule.appLogs.getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on getById');
        expect(log?.details['What happend']).toContain('Unexpected token');
    });

    it('powinien zalogować błąd przy próbie odczytu uszkodzonego pliku (przypadek 2)', async () => {
        const testId = uuid.v4();
        const filePath = path.join(dbService.route, `${testId}.json`);
        await fsPromises.writeFile(filePath, '{invalid json}');
        expect(fs.existsSync(filePath)).toBe(true);
        const result = await dbService.getById(testId);
        expect(result).toBeNull();
        const log = await LogsModule.appLogs.getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on getById');
        expect(log?.details['What happend']).toContain(`Expected property name or '}' in JSON at position 1`);
    });

    it('powinien zalogować błąd przy próbie usunięcia nieistniejącego pliku', async () => {
        const testId = uuid.v4();
        await dbService.removeItemById(testId);
        const log = await LogsModule.appLogs.getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on removeItemById');
        expect(log?.details['What happend']).toContain('ENOENT');
    });

    it('powinien zalogować błąd przy próbie utworzenia pliku który już istnieje', async () => {
        const testId = uuid.v4();
        await dbService.setById(testId, { name: 'Test' });
        await dbService.setById(testId, { name: 'Duplicate' });
        const log = await LogsModule.appLogs.getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on setById');
        expect(log?.details['What happend']).toContain('File already exists');
    });

    it('powinien zalogować błąd przy próbie odczytu nieistniejącego pliku', async () => {
        const testId = uuid.v4();
        await dbService.getById(testId);
        const log = await LogsModule.appLogs.getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on getById');
    });
}); 