import path from "path";
import DbStores from "./DbStores";
import fs from "fs";
import fsPromises from "fs/promises";
import Logs from "@/services/LogService";
import { Document, Pagination } from "./DbTypes";

export const DB_DIRNAME = process.env.NODE_ENV === 'test' ? './db-test' : './db';

class DbService {
    path = path.resolve(process.cwd(), DB_DIRNAME);
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

    __config(config: { dbStore: string, path: string, lock: Record<string, boolean> }) {
        this.dbStore = config.dbStore;
        this.route = path.join(config.path, config.dbStore);
        this.__lock = config.lock;
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
                    return;
                }

                const doc: Document<T> = {
                    ...data,
                    _id: id,
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
            return await new Promise<Document<T> | null>((resolve, reject) => {
                const readFilePath = path.join(this.route, `/${id}.json`);
                fs.readFile(readFilePath, 'utf8', async (err, data) => {
                    if (err) {
                        reject(err);
                    } else if (!data) {
                        resolve(null);
                    } else {
                        try {
                            const file: Document<T> = JSON.parse(data);
                            resolve(file);
                        } catch (e) {
                            reject(e);
                        }
                    }
                });
            });
        }, async () => {
            return null;
        }) ?? null;
    }

    getByIdSilent = async <T extends Record<string, any>>(id: string): Promise<Document<T> | null> => {
        try {
            return await new Promise<Document<T> | null>((resolve, reject) => {
                const readFilePath = path.join(this.route, `/${id}.json`);
                fs.readFile(readFilePath, 'utf8', async (err, data) => {
                    if (err) {
                        reject(err);
                    } else if (!data) {
                        resolve(null);
                    } else {
                        try {

                            const file: Document<T> = JSON.parse(data);
                            resolve(file);
                        } catch (e) {
                            reject(e);
                        }
                    }
                });
            });
        } catch {
            return null;
        }
    }

    getAllByField = async <T extends Record<string, any>>(fieldName: string, fieldValue: any, options: {
        containPhrase?: boolean,
        page: number,
        size: number,
    }): Promise<{ items: Document<T>[], hasMore: boolean }> => {
        return await Logs.appLogs.catchUnhandled('DbService error on getAllByField', async () => {
            const containPhrase = options?.containPhrase ?? false;
            const page = options.page ?? 1;
            const size = options.size ?? 10;
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
                const filteredFiles = decodedFiles.filter((item) => {
                    if (containPhrase) {
                        if (!!item && item[fieldName].includes(fieldValue)) {
                            return true;
                        }
                    } else {
                        if (!!item && item[fieldName] === fieldValue) {
                            return true;
                        }
                    }
                    return false;
                });
                const startIndex = (page - 1) * size;
                const endIndex = startIndex + size;
                const paginatedFiles = filteredFiles.slice(startIndex, endIndex);
                const finalFiles = paginatedFiles.filter(item => !!item);
                return { items: finalFiles, hasMore: filteredFiles.length - 1 > endIndex };
            }
            return { items: [], hasMore: true };
        }, () => {
            return { items: [], hasMore: true } as { items: Document<T>[], hasMore: boolean };
        }) ?? { items: [], hasMore: true } as { items: Document<T>[], hasMore: boolean };
    }

    getAllByFileNames = async <T extends Record<string, any>>(fileNames: string[]): Promise<Document<T>[]> => {
        return await Logs.appLogs.catchUnhandled('DbService error on getAllByFieldArray', async () => {
            const selfRoute = this.route;

            const files = (await Promise.all(fileNames.map(async (fileName) => {
                const filePath = path.join(selfRoute, `/${fileName}.json`);
                const fileExists = await fsPromises.access(filePath, fsPromises.constants.F_OK).then(() => true).catch(() => false);
                if (fileExists) {
                    const raw = await fsPromises.readFile(filePath, 'utf8');
                    const file: Document<T> = JSON.parse(raw);
                    return file;
                } else {
                    return null;
                }
            }))).filter(item => !!item);

            if (files.length > 0) {
                return files;
            }

            return [];


        }, () => {
            return [] as Document<T>[];
        }) ?? [] as Document<T>[];
    }

    getAll = async <T extends Record<string, any>>(pagination: Pagination): Promise<{
        items: Document<T>[],
        hasMore: boolean,
    }> => {
        return await Logs.appLogs.catchUnhandled('DbService error on getAll', async () => {
            const selfRoute = this.route;

            const fileDescriptors = await Logs.appLogs.catchUnhandled('DbService error on getAll', async () => {
                return fsPromises.readdir(selfRoute, { withFileTypes: true });
            });

            if (fileDescriptors) {
                let _fileDescriptorsPaginated = fileDescriptors;

                const { page, size } = pagination;
                const startIndex = (page - 1) * size;
                const endIndex = startIndex + size;
                _fileDescriptorsPaginated = fileDescriptors.slice(startIndex, endIndex);

                const decodedFiles = await Promise.all(_fileDescriptorsPaginated.map(descriptor => Logs.appLogs.catchUnhandled('Corrupted file', async () => {
                    if (descriptor.isFile()) {
                        const fileRaw = await fsPromises.readFile(path.join(selfRoute, descriptor.name), 'utf8');
                        const fileData: Document<T> = JSON.parse(fileRaw);
                        return fileData;
                    }
                })));
                const files = decodedFiles.filter(item => !!item);
                return {
                    items: files,
                    hasMore: fileDescriptors.length - 1 > endIndex,
                };
            }
            return { items: [], hasMore: true } as { items: Awaited<Document<T>>[], hasMore: boolean };
        }, () => {
            return { items: [], hasMore: true } as { items: Awaited<Document<T>>[], hasMore: boolean };
        }) ?? { items: [], hasMore: true } as { items: Awaited<Document<T>>[], hasMore: boolean };
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