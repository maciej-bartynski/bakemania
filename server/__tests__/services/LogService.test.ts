import path from 'path';
import fsPromises from 'fs/promises';
import LogsModule, { LOGS_DIRNAME, LogService } from '@/services/LogService';
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
            expect(files[0]).toMatch(/^\d{13}__[A-Z][a-z]{2}\d{2}-\d{4}__\d{2}-\d{2}-\d{2}__[^.]+\.json$/);
            const log = await appLogs.getLatestLog('app');
            expect(log).not.toBeNull();
            expect(log?.message).toBe(message);
            expect(log?.details.test).toBe(JSON.stringify(details.test));
            expect(log?.timestamp).toBeDefined();
        });

        it('powinien usunąć najstarszy log gdy przekroczony zostanie limit 200 plików', async () => {
            // Tworzymy 201 plików (200 + 1 nowy)
            const logsDir = path.join(TEST_LOGS_PATH, 'app');
            const baseTime = Date.now() - 1000000; // 1 sekunda wstecz

            // Tworzymy 200 plików z różnymi datami utworzenia
            for (let i = 0; i < 200; i++) {
                const timestamp = baseTime + i;
                const fileName = `log_${i}.json`;
                const filePath = path.join(logsDir, fileName);

                // Tworzymy plik z opóźnieniem, aby mieć pewność że daty utworzenia będą różne
                await new Promise(resolve => setTimeout(resolve, 1));
                await fsPromises.writeFile(
                    filePath,
                    JSON.stringify({ message: `Test ${i}`, details: {}, timestamp: new Date(timestamp) })
                );
            }

            // Dodajemy nowy log
            await appLogs.saveReport({
                message: 'New log',
                details: {},
                timestamp: new Date()
            });

            // Sprawdzamy czy mamy dokładnie 200 plików
            const files = await fsPromises.readdir(logsDir);
            expect(files.length).toBe(200);

            // Sprawdzamy czy najstarszy plik został usunięty
            const fileStats = await Promise.all(
                files.map(async (file) => {
                    const filePath = path.join(logsDir, file);
                    const stats = await fsPromises.stat(filePath);
                    return {
                        name: file,
                        birthtime: stats.birthtime
                    };
                })
            );

            const sortedFiles = fileStats.sort((a, b) =>
                a.birthtime.getTime() - b.birthtime.getTime()
            );

            // Najstarszy plik powinien mieć datę utworzenia większą niż baseTime
            const oldestFileBirthtime = sortedFiles[0].birthtime.getTime();
            expect(oldestFileBirthtime).toBeGreaterThan(baseTime);
        });

        it('powinien zachować najnowsze logi i usuwać najstarsze przy dużej liczbie operacji', async () => {
            const logsDir = path.join(TEST_LOGS_PATH, 'app');
            const totalLogs = 1000;
            const expectedLogs = 200;
            const createdLogs: { name: string; birthtime: Date }[] = [];

            // Tworzymy 1000 logów
            for (let i = 0; i < totalLogs; i++) {
                await new Promise(resolve => setTimeout(resolve, 1)); // Zapewnia różne daty utworzenia
                await appLogs.saveReport({
                    message: `Test log ${i}`,
                    details: { index: i },
                    timestamp: new Date()
                });

                // Zapisz informacje o każdym utworzonym logu
                const files = await fsPromises.readdir(logsDir);
                const fileStats = await Promise.all(
                    files.map(async (file) => {
                        const filePath = path.join(logsDir, file);
                        const stats = await fsPromises.stat(filePath);
                        return {
                            name: file,
                            birthtime: stats.birthtime
                        };
                    })
                );

                const newestFile = fileStats.sort((a, b) =>
                    b.birthtime.getTime() - a.birthtime.getTime()
                )[0];

                if (newestFile) {
                    createdLogs.push({
                        name: newestFile.name,
                        birthtime: newestFile.birthtime
                    });
                }

                // Co 100 logów sprawdzamy stan
                if (i % 100 === 0) {
                    expect(files.length).toBeLessThanOrEqual(expectedLogs);
                }
            }

            // Końcowe sprawdzenie
            const finalFiles = await fsPromises.readdir(logsDir);
            expect(finalFiles.length).toBe(expectedLogs);

            // Sprawdź czy wszystkie zachowane logi są najnowsze
            const finalStats = await Promise.all(
                finalFiles.map(async (file) => {
                    const filePath = path.join(logsDir, file);
                    const stats = await fsPromises.stat(filePath);
                    return stats.birthtime;
                })
            );

            // Upewnij się, że mamy wystarczającą liczbę zapisanych logów
            expect(createdLogs.length).toBeGreaterThanOrEqual(expectedLogs);

            // Znajdź najstarszy dozwolony czas (czas utworzenia 200-tego najnowszego logu)
            const oldestAllowedTime = createdLogs
                .sort((a, b) => b.birthtime.getTime() - a.birthtime.getTime())
            [expectedLogs - 1]?.birthtime.getTime();

            expect(oldestAllowedTime).toBeDefined();

            finalStats.forEach(birthtime => {
                expect(birthtime.getTime()).toBeGreaterThanOrEqual(oldestAllowedTime!);
            });
        });
    });

    describe('Wielokrotne serwisy logów', () => {
        const CUSTOM_LOG_PATH = path.join(process.cwd(), 'test-multi-logs');
        const CUSTOM_LOCATION_APP = 'test-app-logs';
        const CUSTOM_LOCATION_WS = 'test-ws-logs';
        const CUSTOM_LOCATION_CLIENT = 'test-client-logs';
        const expectedLogs = 200;
        const totalLogs = 1000;

        const customAppLogs = new LogsModule.Service({ location: LogsModule.LogLocations.App });
        const customWsLogs = new LogsModule.Service({ location: LogsModule.LogLocations.WsServer });
        const customClientLogs = new LogsModule.Service({ location: LogsModule.LogLocations.Client });

        beforeEach(async () => {
            // Przygotuj katalogi
            await fsPromises.rm(CUSTOM_LOG_PATH, { recursive: true, force: true });
            await fsPromises.mkdir(CUSTOM_LOG_PATH, { recursive: true });
            await fsPromises.mkdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_APP), { recursive: true });
            await fsPromises.mkdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_WS), { recursive: true });
            await fsPromises.mkdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_CLIENT), { recursive: true });

            // Skonfiguruj serwisy
            customAppLogs.__config({
                location: CUSTOM_LOCATION_APP,
                logPath: CUSTOM_LOG_PATH
            });

            customWsLogs.__config({
                location: CUSTOM_LOCATION_WS,
                logPath: CUSTOM_LOG_PATH
            });

            customClientLogs.__config({
                location: CUSTOM_LOCATION_CLIENT,
                logPath: CUSTOM_LOG_PATH
            });
        });

        afterAll(async () => {
            await fsPromises.rm(CUSTOM_LOG_PATH, { recursive: true, force: true });
        });

        it('powinien utrzymywać limit 200 logów dla każdego serwisu', async () => {
            // Twórz logi dla każdego serwisu
            for (let i = 0; i < totalLogs; i++) {
                await new Promise(resolve => setTimeout(resolve, 1));

                await customAppLogs.saveReport({
                    message: `App log ${i}`,
                    details: { service: 'app', index: i }
                });

                await customWsLogs.saveReport({
                    message: `WS log ${i}`,
                    details: { service: 'ws', index: i }
                });

                await customClientLogs.saveReport({
                    message: `Client log ${i}`,
                    details: { service: 'client', index: i }
                });
            }

            // Sprawdź liczbę plików dla każdego serwisu
            const appFiles = await fsPromises.readdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_APP));
            const wsFiles = await fsPromises.readdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_WS));
            const clientFiles = await fsPromises.readdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_CLIENT));

            expect(appFiles.length).toBe(expectedLogs);
            expect(wsFiles.length).toBe(expectedLogs);
            expect(clientFiles.length).toBe(expectedLogs);
        });

        it('powinien zachować najnowsze logi dla każdego serwisu', async () => {
            // Twórz logi dla każdego serwisu
            for (let i = 0; i < totalLogs; i++) {
                await new Promise(resolve => setTimeout(resolve, 1));

                await customAppLogs.saveReport({
                    message: `App log ${i}`,
                    details: { service: 'app', index: i }
                });

                await customWsLogs.saveReport({
                    message: `WS log ${i}`,
                    details: { service: 'ws', index: i }
                });

                await customClientLogs.saveReport({
                    message: `Client log ${i}`,
                    details: { service: 'client', index: i }
                });
            }

            // Sprawdź zawartość logów dla każdego serwisu
            const checkServiceLogs = async (service: LogService, expectedService: string) => {
                const files = await fsPromises.readdir(path.join(CUSTOM_LOG_PATH, service.location));
                const fileStats = await Promise.all(
                    files.map(async (file) => {
                        const filePath = path.join(CUSTOM_LOG_PATH, service.location, file);
                        const content = await fsPromises.readFile(filePath, 'utf8');
                        const stats = await fsPromises.stat(filePath);
                        return {
                            content: JSON.parse(content),
                            birthtime: stats.birthtime
                        };
                    })
                );

                // Sprawdź czy wszystkie logi są z odpowiedniego serwisu
                fileStats.forEach(stat => {
                    expect(stat.content.details.service).toBe(expectedService);
                });

                // Sprawdź czy zachowane są najnowsze logi
                const sortedStats = fileStats.sort((a, b) =>
                    b.birthtime.getTime() - a.birthtime.getTime()
                );

                // Sprawdź czy indeksy są z ostatnich 200 logów
                const oldestAllowedIndex = totalLogs - expectedLogs;
                sortedStats.forEach(stat => {
                    expect(stat.content.details.index).toBeGreaterThanOrEqual(oldestAllowedIndex);
                });
            };

            await checkServiceLogs(customAppLogs, 'app');
            await checkServiceLogs(customWsLogs, 'ws');
            await checkServiceLogs(customClientLogs, 'client');
        });

        it('powinien zachować niezależność między serwisami', async () => {
            // Twórz logi dla każdego serwisu
            for (let i = 0; i < totalLogs; i++) {
                await new Promise(resolve => setTimeout(resolve, 1));

                await customAppLogs.saveReport({
                    message: `App log ${i}`,
                    details: { service: 'app', index: i }
                });

                await customWsLogs.saveReport({
                    message: `WS log ${i}`,
                    details: { service: 'ws', index: i }
                });

                await customClientLogs.saveReport({
                    message: `Client log ${i}`,
                    details: { service: 'client', index: i }
                });
            }

            // Sprawdź czy każdy serwis ma swoje własne logi
            const appFiles = await fsPromises.readdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_APP));
            const wsFiles = await fsPromises.readdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_WS));
            const clientFiles = await fsPromises.readdir(path.join(CUSTOM_LOG_PATH, CUSTOM_LOCATION_CLIENT));

            // Sprawdź czy nazwy plików są unikalne dla każdego serwisu
            const appFileNames = new Set(appFiles);
            const wsFileNames = new Set(wsFiles);
            const clientFileNames = new Set(clientFiles);

            // Sprawdź czy nie ma wspólnych plików między serwisami
            const hasCommonFiles = (set1: Set<string>, set2: Set<string>) => {
                return [...set1].some(file => set2.has(file));
            };

            expect(hasCommonFiles(appFileNames, wsFileNames)).toBe(false);
            expect(hasCommonFiles(appFileNames, clientFileNames)).toBe(false);
            expect(hasCommonFiles(wsFileNames, clientFileNames)).toBe(false);
        });
    });
}); 