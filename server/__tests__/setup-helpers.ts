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
        if (fs.existsSync(TEST_LOGS_PATH)) {
            await fsPromises.rm(TEST_LOGS_PATH, { recursive: true, force: true });
        }

        // Tworzenie folderów testowych
        await fsPromises.mkdir(TEST_LOGS_PATH, { recursive: true });
        await fsPromises.mkdir(path.join(TEST_LOGS_PATH, 'app'), { recursive: true });
        await fsPromises.mkdir(path.join(TEST_LOGS_PATH, 'client'), { recursive: true });
        await fsPromises.mkdir(path.join(TEST_LOGS_PATH, 'ws-server'), { recursive: true });
        await fsPromises.mkdir(path.join(TEST_LOGS_PATH, 'email'), { recursive: true });
    } catch (error) {
        console.error('Error cleaning test logs:', error);
        throw error;
    }
};

export const getLatestLog = async (_path: string) => {
    const resolvedPath = path.join(TEST_LOGS_PATH, _path);
    const files = await fsPromises.readdir(resolvedPath);
    if (files.length === 0) return null;

    const latestFile = files.sort().pop();
    const content = await fsPromises.readFile(
        path.join(resolvedPath, latestFile!),
        'utf8'
    );
    return JSON.parse(content);
};