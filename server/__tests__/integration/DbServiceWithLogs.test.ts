import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import DbService from '../../services/DbService/DbService';
import DbStores from '../../services/DbService/DbStores';
import { cleanTestDatabase, cleanTestLogs, getLatestLog, TEST_DB_PATH, TEST_LOGS_PATH } from '../setup-helpers';

describe('DbService with Logs Integration', () => {
    const TEST_APP_LOGS_PATH = path.join(TEST_LOGS_PATH, 'app');
    let dbService: DbService;
    const testId = 'test-doc-123';

    beforeEach(async () => {
        await cleanTestLogs();
        await cleanTestDatabase();
        dbService = new DbService({ dbStore: DbStores.Users });
    });

    afterEach(async () => {
        await cleanTestLogs();
        await cleanTestDatabase();
    });

    // const getLatestLog = async () => {
    //     const files = await fsPromises.readdir(TEST_APP_LOGS_PATH);
    //     if (files.length === 0) return null;

    //     const latestFile = files.sort().pop();
    //     const content = await fsPromises.readFile(
    //         path.join(TEST_APP_LOGS_PATH, latestFile!),
    //         'utf8'
    //     );
    //     return JSON.parse(content);
    // };

    it('powinien zalogować błąd przy próbie aktualizacji nieistniejącego pliku', async () => {
        await dbService.updateById(testId, { name: 'Test' });
        const log = await getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on updateById');
        expect(log?.details['What happend']).toContain('ENOENT');
    });

    it('powinien zalogować błąd przy próbie odczytu uszkodzonego pliku (przypadek 1)', async () => {
        const filePath = path.join(TEST_DB_PATH, DbStores.Users, `${testId}.json`);
        await fsPromises.writeFile(filePath, 'invalid json');
        expect(fs.existsSync(filePath)).toBe(true);
        const result = await dbService.getById(testId);
        expect(result).toBeNull();
        const log = await getLatestLog('app');
        expect(log).not.toBeNull();
        console.warn('log', log);
        expect(log?.message).toBe('DbService error on getById');
        expect(log?.details['What happend']).toContain('Unexpected token');
    });

    it('powinien zalogować błąd przy próbie odczytu uszkodzonego pliku (przypadek 2)', async () => {
        const filePath = path.join(TEST_DB_PATH, DbStores.Users, `${testId}.json`);
        await fsPromises.writeFile(filePath, '{invalid json}');
        expect(fs.existsSync(filePath)).toBe(true);
        const result = await dbService.getById(testId);
        expect(result).toBeNull();
        const log = await getLatestLog('app');
        expect(log).not.toBeNull();
        console.warn('log3', log);
        expect(log?.message).toBe('DbService error on getById');
        expect(log?.details['What happend']).toContain(`Expected property name or '}' in JSON at position 1`);
    });

    it('powinien zalogować błąd przy próbie usunięcia nieistniejącego pliku', async () => {
        await dbService.removeItemById(testId);
        const log = await getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on removeItemById');
        expect(log?.details['What happend']).toContain('ENOENT');
    });

    it('powinien zalogować błąd przy próbie utworzenia pliku który już istnieje', async () => {
        await dbService.setById(testId, { name: 'Test' });
        await dbService.setById(testId, { name: 'Duplicate' });
        const log = await getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on setById');
        expect(log?.details['What happend']).toContain('File already exists');
    });

    it('powinien zalogować błąd przy próbie odczytu nieistniejącego pliku', async () => {
        await dbService.getById(testId);
        const log = await getLatestLog('app');
        expect(log).not.toBeNull();
        expect(log?.message).toBe('DbService error on getById');
    });
}); 