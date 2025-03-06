import fs from 'fs';
import path from 'path';

class LogService {
    logPath = path.resolve(__dirname, '../../db/logs/');
    location?: Locations;

    constructor(params?: {
        location?: Locations,
    }) {
        this.location = params?.location;
    }

    catchUnhandled(message: string, callback: () => (any | Promise<any>)) {
        try {
            return callback()
        } catch (e) {
            console.error(`Catched error: ${e}`);
            this.report(message, (setDetails) => {
                setDetails('What happend:', (e as any)?.message || `${e}`);
            });
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
        console.error(entry);
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

enum Locations {
    Client = 'client',
    WsServer = 'ws-server',
    App = 'app'
}

const clientLogs = new LogService({ location: Locations.Client });
const wsLogs = new LogService({ location: Locations.WsServer });
const appLogs = new LogService({ location: Locations.App });

export type { Locations };

const Logs = {
    Service: LogService,
    Locations,
    wsLogs,
    appLogs,
    clientLogs
}

export default Logs
