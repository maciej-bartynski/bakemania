import path from "path";
import fs from 'fs';
import fsPromises from 'fs/promises';

const DB_FOLDER_NAME = './db-test';
export const TEST_DB_PATH = path.resolve(process.cwd(), DB_FOLDER_NAME);

const LOGS_FOLDER_NAME = './logs-test';
export const TEST_LOGS_PATH = path.resolve(process.cwd(), LOGS_FOLDER_NAME);

export const cleanTestDatabase = async () => {
    try {
        if (fs.existsSync(TEST_DB_PATH)) {
            await fsPromises.rm(TEST_DB_PATH, { recursive: true, force: true });
        }
        await fsPromises.mkdir(TEST_DB_PATH, { recursive: true });
        await fsPromises.mkdir(path.join(TEST_DB_PATH, 'users'), { recursive: true });
        await fsPromises.mkdir(path.join(TEST_DB_PATH, 'managers'), { recursive: true });
        await fsPromises.mkdir(path.join(TEST_DB_PATH, 'admins'), { recursive: true });
        await fsPromises.mkdir(path.join(TEST_DB_PATH, 'appConfig'), { recursive: true });
    } catch (error) {
        console.error('Error cleaning test database:', error);
        throw error;
    }
};

export const cleanTestLogs = async () => {
    try {
        if (fs.existsSync(LOGS_FOLDER_NAME)) {
            await fsPromises.rm(LOGS_FOLDER_NAME, { recursive: true, force: true });
        }
        await fsPromises.mkdir(LOGS_FOLDER_NAME, { recursive: true });
        await fsPromises.mkdir(path.join(LOGS_FOLDER_NAME, 'app'), { recursive: true });
        await fsPromises.mkdir(path.join(LOGS_FOLDER_NAME, 'client'), { recursive: true });
        await fsPromises.mkdir(path.join(LOGS_FOLDER_NAME, 'email'), { recursive: true });
        await fsPromises.mkdir(path.join(LOGS_FOLDER_NAME, 'ws-server'), { recursive: true });
    } catch (error) {
        console.error('Error cleaning test logs:', error);
        throw error;
    }
};