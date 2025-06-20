import path from 'path';
import fsPromises from 'fs/promises';

export const LOGS_DIRNAME = process.env.NODE_ENV === 'test' ? 'logs-test' : 'logs';

class LogService {
    logPath = path.join(process.cwd(), LOGS_DIRNAME);
    location: LogLocations;

    constructor(params: { location: LogLocations }) {
        this.location = params.location;
    }

    __config(conf: { location: string, logPath: string }) {
        if (conf.location) {
            this.location = conf.location as LogLocations;
        }

        if (conf.logPath) {
            this.logPath = conf.logPath;
        }
    }

    async __drop() {
        const logsLocationDirname = path.join(this.logPath, this.location || '');
        await fsPromises.rm(logsLocationDirname, { recursive: true, force: true });
        await fsPromises.mkdir(logsLocationDirname, { recursive: true });
    }

    async catchUnhandled<T extends any>(message: string, callback: () => (T | Promise<T>), fallback?: (e: unknown) => (T | Promise<T>)): Promise<T | null> {
        try {
            return await callback()
        } catch (e) {

            await this.report(message, (setDetails) => {
                setDetails('What happend', (e as any)?.message || e);
            });

            if (fallback) {
                try {
                    return await fallback(e)
                } catch (fallbackError) {
                    await this.report(message, (setDetails) => {
                        setDetails('Fallback error', (fallbackError as any)?.message || `${fallbackError}`);
                    });
                }
            }
            return null;
        }
    }

    async report(
        message: string | number | boolean,
        setData: (callback: (key: string, value: any) => void) => void
    ) {
        const entry: Entry = {
            message,
            details: {} as Record<string, string | number | boolean>,
            timestamp: new Date(),
        };
        setData((key: string, value: any) => {
            entry.details[key] = (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
                ? value
                : JSON.stringify(value);
        });
        return await this.saveReport(entry);
    }

    async saveReport(entry: Entry) {
        const now = new Date();
        const timestamp = now.getTime();
        const pad = (num: number) => String(num).padStart(2, '0');
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());

        const dateString = now.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        }).replaceAll(' ', '').replaceAll(',', '-');
        const fileName = `${timestamp}__${dateString}__${hours}-${minutes}-${seconds}__${this.location}`;
        const logFullPath = path.join(this.logPath, this.location || '', `${fileName}.json`);

        try {
            const logsDir = path.join(this.logPath, this.location || '');
            await fsPromises.mkdir(logsDir, { recursive: true });

            const files = await fsPromises.readdir(logsDir);
            if (files.length >= 200) {
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

                const filesToDelete = sortedFiles.slice(0, sortedFiles.length - 199);
                await Promise.all(
                    filesToDelete.map(file =>
                        fsPromises.unlink(path.join(logsDir, file.name))
                    )
                );
            }

            await fsPromises.writeFile(logFullPath, JSON.stringify({ ...entry, timestamp: new Date() }, null, 2), 'utf8');
        } catch (err) {
            console.error('LogService error on saving report:', err);
        }
    }

    async getLatestLog(_path: string) {
        const resolvedPath = path.join(this.logPath, this.location || '');
        const files = await fsPromises.readdir(resolvedPath);
        if (files.length === 0) return null;
        const latestFile = files.sort().pop();
        const content = await fsPromises.readFile(
            path.join(resolvedPath, latestFile!),
            'utf8'
        );
        return JSON.parse(content);
    };
}

type Entry = {
    message: string | number | boolean;
    details: Record<string, string | number | boolean>;
    timestamp?: Date;
}

enum LogLocations {
    Client = 'client',
    WsServer = 'ws-server',
    App = 'app',
    Email = 'email'
}

const clientLogs = new LogService({ location: LogLocations.Client });
const wsLogs = new LogService({ location: LogLocations.WsServer });
const appLogs = new LogService({ location: LogLocations.App });
const emailLogs = new LogService({ location: LogLocations.Email });

export type { LogLocations };

const Logs = {
    Service: LogService,
    LogLocations,
    wsLogs,
    appLogs,
    clientLogs,
    emailLogs
}

export type { LogService };

export default Logs
