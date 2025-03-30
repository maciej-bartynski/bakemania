import path from "path";
import DbStores from "./DbStores";
import fs from "fs";
import fsPromises from "fs/promises";
import Logs from "../LogService";
import { Document, Pagination } from "./DbTypes";

class DbService {
    path = path.resolve(process.cwd(), './db');
    dbStore: string;
    route: string;
    __lock: Record<string, boolean>;

    constructor(config: {
        dbStore: DbStores
    }) {
        this.dbStore = config.dbStore;
        this.route = path.join(this.path, this.dbStore);
        this.__lock = {};
    }

    __drop = async () => {
        await fsPromises.rm(this.route, { recursive: true, force: true });
        await fsPromises.mkdir(this.route, { recursive: true });
    }

    updateById = async <T extends Record<string, any>>(id: string, data: Partial<T>): Promise<string | null> => {
        if (this.__lock[id]) {
            return null;
        }
        this.__lock[id] = true;
        return await Logs.appLogs.catchUnhandled('DbService error on updateById', async () => {
            const filePath = path.join(this.route, `/${id}.json`);
            const record = await fsPromises.readFile(filePath, 'utf8');
            const doc: Document<T> = await JSON.parse(record);
            const newDoc: Document<T> = {
                ...doc,
                ...data,
                metadata: {
                    ...doc.metadata,
                    updatedAt: this.getFormattedDateString(new Date()),
                }
            }
            await fsPromises.writeFile(filePath, JSON.stringify(newDoc, null, 2), 'utf8');
            delete this.__lock[id];
            return id;
        }, () => {
            delete this.__lock[id];
            return null;
        }) ?? null;
    }

    setById = async <T extends Record<string, any>>(id: string, data: T): Promise<string | null> => {
        if (this.__lock[id]) {
            return null;
        }
        this.__lock[id] = true;
        return await Logs.appLogs.catchUnhandled('DbService error on setById', async () => {
            const resolvedOperation = await new Promise<string | void>(async (resolve, reject) => {
                const createFilePath = path.join(this.route, `/${id}.json`);
                const fileExits = await fsPromises.access(createFilePath, fsPromises.constants.F_OK).then(() => true).catch(() => false);

                if (fileExits) {
                    reject(new Error("File already exists"));
                }

                const doc: Document<T> = {
                    _id: id,
                    ...data,
                    metadata: {
                        createdAt: this.getFormattedDateString(new Date()),
                    }
                }
                fs.writeFile(createFilePath, JSON.stringify(doc, null, 2), 'utf8', (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(id);
                    }
                });
            }) ?? null;

            delete this.__lock[id];
            return resolvedOperation;
        }, () => {
            delete this.__lock[id];
            return null;
        }) ?? null;
    }

    removeItemById = async (id: string): Promise<boolean | null> => {
        if (this.__lock[id]) {
            return null;
        }
        this.__lock[id] = true;

        return await Logs.appLogs.catchUnhandled('DbService error on removeItemById', async () => {
            const filePath = path.join(this.route, `/${id}.json`);
            await fsPromises.unlink(filePath);

            delete this.__lock[id];
            return true;
        }, () => {
            delete this.__lock[id];
            return false;
        }) ?? false;
    }

    getById = async <T extends Record<string, any>>(id: string): Promise<Document<T> | null> => {
        return await Logs.appLogs.catchUnhandled('DbService error on getById', async () => {
            return new Promise<Document<T> | null>((resolve) => {
                const readFilePath = path.join(this.route, `/${id}.json`);
                fs.readFile(readFilePath, 'utf8', (err, data) => {
                    if (err || !data) {
                        resolve(null);
                        /**
                         * Do nothing: record does not exist
                         */
                    } else {
                        try {
                            const file: Document<T> = JSON.parse(data);
                            resolve(file);
                        } catch (e) {
                            /**
                             * Something went wrong with the file.
                             * Return null and throw the error to the Logs.
                             */
                            resolve(null);
                            throw e;
                        }
                    }
                });
            });
        }, async () => {
            return null;
        }) ?? null;
    }

    getAllByField = async <T extends Record<string, any>>(fieldName: string, fieldValue: any): Promise<Document<T>[]> => {
        return await Logs.appLogs.catchUnhandled('DbService error on getAllByField', async () => {
            const selfRoute = this.route;

            const fileDescriptors = await Logs.appLogs.catchUnhandled('DbService error on getAll', async () => {
                return fsPromises.readdir(selfRoute, { withFileTypes: true });
            });

            if (fileDescriptors) {
                const decodedFiles = await Promise.all(fileDescriptors.map(async (descriptor) => Logs.appLogs.catchUnhandled('Corrupted file', async () => {
                    if (descriptor.isFile()) {
                        const fileRaw = await fsPromises.readFile(path.join(selfRoute, descriptor.name), 'utf8');
                        const fileData: Document<T> = JSON.parse(fileRaw);
                        return fileData;
                    }
                })));
                const files = decodedFiles.filter((item) => {
                    if (!!item && item[fieldName] === fieldValue) {
                        return true;
                    }
                    return false;
                });
                const finalFiles = files.filter(item => !!item);
                return finalFiles;
            }
            return [] as Document<T>[];
        }, () => {
            return [] as Document<T>[];
        }) ?? [] as Document<T>[];
    }

    getAll = async <T extends Record<string, any>>(pagination?: Pagination): Promise<Document<T>[]> => {
        return await Logs.appLogs.catchUnhandled('DbService error on getAll', async () => {
            const selfRoute = this.route;

            const fileDescriptors = await Logs.appLogs.catchUnhandled('DbService error on getAll', async () => {
                return fsPromises.readdir(selfRoute, { withFileTypes: true });
            });

            if (fileDescriptors) {
                let _fileDescriptorsPaginated = fileDescriptors;
                if (pagination) {
                    const { page, size } = pagination;
                    const startIndex = (page - 1) * size;
                    const endIndex = startIndex + size;
                    _fileDescriptorsPaginated = fileDescriptors.slice(startIndex, endIndex);
                }
                const decodedFiles = await Promise.all(fileDescriptors.map(descriptor => Logs.appLogs.catchUnhandled('Corrupted file', async () => {
                    if (descriptor.isFile()) {
                        const fileRaw = await fsPromises.readFile(path.join(selfRoute, descriptor.name), 'utf8');
                        const fileData: Document<T> = JSON.parse(fileRaw);
                        return fileData;
                    }
                })));
                const files = decodedFiles.filter(item => !!item);
                return files;
            }
            return [];
        }, () => {
            return [] as Document<T>[];
        }) ?? [] as Document<T>[];
    }

    getFormattedDateString(date: Date): string {
        const pad = (num: number) => String(num).padStart(2, '0');
        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    }

    lockFileId = (id: string) => {
        this.__lock[id] = true;
    }

    unlockFileId = (id: string) => {
        this.__lock[id] = false;
    }
}

export default DbService