import fs from 'fs';
import path from 'path';

const LOGS_FOLDER_NAME = process.env.NODE_ENV === 'test' ? 'logs-test' : 'logs';

class LogService {
    logPath = path.join(process.cwd(), LOGS_FOLDER_NAME);
    location?: LogLocations;

    constructor(params?: {
        location?: LogLocations,
    }) {
        this.location = params?.location;
    }

    async catchUnhandled<T extends any>(message: string, callback: () => (T | Promise<T>), fallback?: (e: unknown) => (T | Promise<T>)) {
        try {
            return await callback()
        } catch (e) {
            // console.error(`Catched error: ${e}`);
            this.report(message, (setDetails) => {
                setDetails('What happend:', (e as any)?.message || `${e}`);
            });

            if (fallback) {
                try {
                    return await fallback(e)
                } catch (fallbackError) {
                    // console.error(`Catched fallback error: ${fallbackError}`);
                    this.report(message, (setDetails) => {
                        setDetails('Fallback error:', (fallbackError as any)?.message || `${fallbackError}`);
                    });
                }
            }
        }
    }

    async report(
        message: string | number | boolean,
        setData: (callback: (key: string, value: any) => void) => void
    ) {
        const entry: Entry = {
            message,
            details: {} as Record<string, string>,
        };
        setData((key: string, value: any) => {
            entry.details[key] = JSON.stringify(value);
        });
        return this.saveReport(entry);
    }

    async saveReport(entry: Entry) {
        const now = new Date();
        const pad = (num: number) => String(num).padStart(2, '0');
        const day = pad(now.getDate());
        const month = pad(now.getMonth() + 1);
        const year = now.getFullYear();
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());
        const fileName = `${day}-${month}-${year}_${hours}:${minutes}:${seconds}`;
        const logFullPath = this.logPath + '/' + this.location + `/${fileName}.json`;
        fs.writeFile(logFullPath, JSON.stringify(entry, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('LogService error on saving report:', err);
            }
        })
    }
}

type Entry = {
    message: string | number | boolean;
    details: Record<string, string>;
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

export default Logs
