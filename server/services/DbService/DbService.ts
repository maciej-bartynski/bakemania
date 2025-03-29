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
    __cache: Record<string, Document<any>>;
    __cacheCleanupInterval?: NodeJS.Timeout;
    __lock: Record<string, boolean>;
    __ignoreCache: boolean;

    constructor(config: {
        dbStore: DbStores
    }) {
        this.dbStore = config.dbStore;
        this.route = path.join(this.path, this.dbStore);
        this.__cache = {};
        this.__lock = {};
        this.__ignoreCache = false;
    }

    async __drop() {
        await fsPromises.rm(this.route, { recursive: true, force: true });
        await fsPromises.mkdir(this.route, { recursive: true });
    }

    async __prepareCache() {
        await Logs.appLogs.catchUnhandled('DbService error on __prepareCache', async () => {
            this.__ignoreCache = true;
            this.__stopCacheCleanup();
            const fileDescriptors = await fsPromises.readdir(this.route, { withFileTypes: true });
            const filesCached = fileDescriptors.filter(descriptor => descriptor.isFile());

            for (const descriptor of filesCached) {
                const fileRaw = await fsPromises.readFile(path.join(this.route, descriptor.name), 'utf8');
                const fileData: Document<any> = JSON.parse(fileRaw);
                this.__cache[descriptor.name] = fileData;
            }

            this.__startCacheCleanup();
            this.__ignoreCache = false;
        }, () => {
            this.__cache = {};
            this.__stopCacheCleanup();
            this.__cacheCleanupInterval = undefined;
            this.__ignoreCache = false;
        });
    }

    async __startCacheCleanup() {
        this.__ignoreCache = true;
        Logs.appLogs.catchUnhandled('DbService error on __startCacheCleanup', async () => {
            const tenMinutes = 1000 * 60 * 10;
            this.__cacheCleanupInterval = setInterval(() => {
                this.__prepareCache();
            }, tenMinutes);
            this.__ignoreCache = false;
        }, () => {
            this.__cache = {};
            this.__stopCacheCleanup();
            this.__cacheCleanupInterval = undefined;
            this.__ignoreCache = false;
            this.__prepareCache();
        });
    }

    async __stopCacheCleanup() {
        Logs.appLogs.catchUnhandled('DbService error on __stopCacheCleanup', async () => {
            if (this.__cacheCleanupInterval) {
                clearInterval(this.__cacheCleanupInterval);
                this.__cacheCleanupInterval = undefined;
            }
            this.__ignoreCache = false;
        }, () => {
            this.__cacheCleanupInterval = undefined;
            this.__ignoreCache = false;
        });
    }

    async __refreshCacheItemById(id: string) {
        if (this.__ignoreCache) {
            return;
        }
        try {
            const fileRaw = await fsPromises.readFile(path.join(this.route, `/${id}.json`), 'utf8');
            const fileData: Document<any> = JSON.parse(fileRaw);
            this.__cache[id] = fileData;
        } catch (e) {
            delete this.__cache[id];
        }
    }

    async updateById<T extends Record<string, any>>(id: string, data: Partial<T>): Promise<string | null> {
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
            await this.__refreshCacheItemById(id);
            delete this.__lock[id];
            return id;
        }, () => {
            delete this.__lock[id];
            return null;
        }) ?? null;
    }

    async setById<T extends Record<string, any>>(id: string, data: T): Promise<string | null> {
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
            this.__refreshCacheItemById(id);
            delete this.__lock[id];
            return resolvedOperation;
        }, async () => {
            try {
                await this.__refreshCacheItemById(id);
            } catch (e) {
                delete this.__lock[id];
                return this.__cache[id] ? id : null;
            }
            delete this.__lock[id];
            return this.__cache[id] ? id : null;
        }) ?? null;
    }

    async removeItemById(id: string): Promise<boolean | null> {
        if (this.__lock[id]) {
            return null;
        }
        this.__lock[id] = true;

        return await Logs.appLogs.catchUnhandled('DbService error on removeItemById', async () => {
            const filePath = path.join(this.route, `/${id}.json`);
            await fsPromises.unlink(filePath);
            await this.__refreshCacheItemById(id);
            delete this.__lock[id];
            return true;
        }, async () => {
            try {
                await this.__refreshCacheItemById(id);
                delete this.__lock[id];
                return false;
            } catch (e) {
                delete this.__lock[id];
                return false;
            }
        }) ?? false;
    }

    async getById<T extends Record<string, any>>(id: string): Promise<Document<T> | null> {
        return await Logs.appLogs.catchUnhandled('DbService error on getById', async () => {

            if (this.__cache[id]) {
                return this.__cache[id] as Document<T>;
            }

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

    async getAllByField<T extends Record<string, any>>(fieldName: string, fieldValue: any): Promise<Document<T>[]> {
        return await Logs.appLogs.catchUnhandled('DbService error on getAllByField', async () => {
            const selfRoute = this.route;

            if (Object.keys(this.__cache).length > 0) {
                return Object.values(this.__cache).filter((item) => item[fieldName] === fieldValue) as Document<T>[];
            }

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

    async getAll<T extends Record<string, any>>(pagination?: Pagination): Promise<Document<T>[]> {
        return await Logs.appLogs.catchUnhandled('DbService error on getAll', async () => {
            const selfRoute = this.route;

            if (Object.keys(this.__cache).length > 0) {
                const items = Object.values(this.__cache) as Document<T>[];
                if (pagination) {
                    const { page, size } = pagination;
                    const startIndex = (page - 1) * size;
                    const endIndex = startIndex + size;
                    return items.slice(startIndex, endIndex);
                } else {
                    return items;
                }
            }

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

    lockFileId(id: string) {
        this.__lock[id] = true;
    }

    unlockFileId(id: string) {
        this.__lock[id] = false;
    }
}

export default DbService