import dotenv from 'dotenv';
import path from "path";

if (process.env.NODE_ENV !== 'production') {
    const devEnvFile = path.resolve(__dirname, '../.env');
    dotenv.config({ path: devEnvFile });
} else {
    /**
     * Docker will populate envs.
     * See Makefile "start".
     */
}

import fs from "fs/promises";
import UserRole, { UserModel } from "./services/DbService/instances/UsersDb.types";
import DbService from "./services/DbService/DbService";
import DbStores from "./services/DbService/DbStores";
import * as uuid from 'uuid';
import bcrypt from 'bcryptjs';
import { ManagerModel } from "./services/DbService/instances/ManagersDb.types";
import { AppConfig } from "./api/appConfig/type";

const fixtureUsersDb = new DbService({ dbStore: DbStores.Users });
fixtureUsersDb.path = path.join(process.cwd(), "defaults")
fixtureUsersDb.route = path.join(fixtureUsersDb.path, fixtureUsersDb.dbStore);

const fixtureManagersDb = new DbService({ dbStore: DbStores.Managers });
fixtureManagersDb.path = path.join(process.cwd(), "defaults")
fixtureManagersDb.route = path.join(fixtureManagersDb.path, fixtureManagersDb.dbStore);

const fixtureAppConfigDb = new DbService({ dbStore: DbStores.AppConfig });
fixtureAppConfigDb.path = path.join(process.cwd(), "defaults")
fixtureAppConfigDb.route = path.join(fixtureAppConfigDb.path, fixtureAppConfigDb.dbStore);

const fixtureLogsDb = new DbService({ dbStore: DbStores.Logs });
fixtureLogsDb.path = path.join(process.cwd(), "defaults")
fixtureLogsDb.route = path.join(fixtureLogsDb.path, fixtureLogsDb.dbStore);

const fixtureAdminsDb = new DbService({ dbStore: DbStores.Admins });
fixtureAdminsDb.path = path.join(process.cwd(), "defaults")
fixtureAdminsDb.route = path.join(fixtureAdminsDb.path, fixtureAdminsDb.dbStore);

const defaultUsers = async () => {

    await fixtureUsersDb.__drop();

    const passwords: [string, string, string] = ['123QWEasd!', '123QWEasd!', '123QWEasd!'];
    const hashes: [string, string, string] = await Promise.all(passwords.map(async (p) => await bcrypt.hash(p, 10))) as any;
    const ids: [string, string, string] = [uuid.v4(), uuid.v4(), uuid.v4()];

    await fixtureUsersDb.setById<UserModel>(ids[0], {
        _id: ids[0],
        email: 'klient@gmail.com',
        password: hashes[0],
        role: UserRole.User,
        stamps: {
            amount: 0,
            history: []
        },
        agreements: true,
        verification: {
            isVerified: true,
        }
    });

    await fixtureUsersDb.setById<UserModel>(ids[1], {
        _id: ids[1],
        email: 'bogdan@gmail.com',
        password: hashes[1],
        role: UserRole.User,
        stamps: {
            amount: 0,
            history: []
        },
        agreements: true,
        verification: {
            isVerified: true,
        }
    });

    await fixtureUsersDb.setById<UserModel>(ids[2], {
        _id: ids[2],
        email: 'kot@gmail.com',
        password: hashes[2],
        role: UserRole.User,
        stamps: {
            amount: 0,
            history: []
        },
        agreements: true,
        verification: {
            isVerified: true,
        }
    });
}

const defaultManagers = async () => {

    await fixtureManagersDb.__drop();

    const passwords: [string, string, string] = ['123QWEasd!', '123QWEasd!', '123QWEasd!'];
    const hashes: [string, string, string] = await Promise.all(passwords.map(async (p) => await bcrypt.hash(p, 10))) as any;
    const ids: [string, string, string] = [uuid.v4(), uuid.v4(), uuid.v4()];

    await fixtureManagersDb.setById<ManagerModel>(ids[0], {
        _id: ids[0],
        email: 'papiesz@gmail.com',
        password: hashes[0],
        role: UserRole.Manager,
        history: [],
        agreements: true,
    });

    await fixtureManagersDb.setById<ManagerModel>(ids[1], {
        _id: ids[1],
        email: 'papiesz2@gmail.com',
        password: hashes[1],
        role: UserRole.Manager,
        history: [],
        agreements: true,
    });

    await fixtureManagersDb.setById<ManagerModel>(ids[2], {
        _id: ids[2],
        email: 'papiesz3@gmail.com',
        password: hashes[2],
        role: UserRole.Manager,
        history: [],
        agreements: true,
    });

}

const defaultConfig = async () => {

    await fixtureAppConfigDb.__drop();

    await fixtureAppConfigDb.setById<AppConfig>('appConfig', {
        cardSize: 7,
        discount: 15,
        stampsInRow: 4
    })
}

async function resetDatabase() {
    await defaultConfig();
    await defaultUsers();
    await defaultManagers();

    try {
        // Ścieżka do folderu `db` (względem katalogu, w którym uruchomiony jest proces)
        const dbPath = path.join(process.cwd(), "db");
        // Ścieżka do folderu `defaults` (względem pliku `dbFixtures.ts`)
        const defaultsPath = path.join(process.cwd(), "defaults");
        // 1. Usuń folder `db` i jego zawartość
        await fs.rm(dbPath, { recursive: true, force: true });
        // 2. Utwórz pusty folder `db`
        await fs.mkdir(dbPath, { recursive: true });
        // 3. Kopiuj zawartość `defaults` do `db`
        await copyDirectory(defaultsPath, dbPath);

        console.log("Baza danych została zresetowana!");
    } catch (error) {
        console.error("Błąd podczas resetowania bazy danych:", error);
    }
}

async function copyDirectory(source: string, target: string) {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(target, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

resetDatabase();
