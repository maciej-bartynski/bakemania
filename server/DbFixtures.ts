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
import { AdminModel } from './services/DbService/instances/AdminsDb.types';
import Logs from './services/LogService';
import { AppConfig } from './services/DbService/instances/AppConfigDb.types';

async function dbFixtures() {
    try {
        const dbPath = path.join(process.cwd(), "db");
        await fs.rm(dbPath, { recursive: true, force: true });
        await fs.mkdir(dbPath, { recursive: true });
        for (const store of Object.values(DbStores)) {
            await fs.mkdir(path.join(dbPath, store), { recursive: true });
        }
        console.log("[1] Database structure created");
        const fixtureUsersDb = new DbService({ dbStore: DbStores.Users });
        fixtureUsersDb.path = dbPath;
        fixtureUsersDb.route = path.join(fixtureUsersDb.path, fixtureUsersDb.dbStore);

        const fixtureManagersDb = new DbService({ dbStore: DbStores.Managers });
        fixtureManagersDb.path = dbPath;
        fixtureManagersDb.route = path.join(fixtureManagersDb.path, fixtureManagersDb.dbStore);

        const fixtureAppConfigDb = new DbService({ dbStore: DbStores.AppConfig });
        fixtureAppConfigDb.path = dbPath
        fixtureAppConfigDb.route = path.join(fixtureAppConfigDb.path, fixtureAppConfigDb.dbStore);

        const fixtureAdminsDb = new DbService({ dbStore: DbStores.Admins });
        fixtureAdminsDb.path = dbPath
        fixtureAdminsDb.route = path.join(fixtureAdminsDb.path, fixtureAdminsDb.dbStore);

        console.log("[2] Database instances created");

        const defaultUsers = async () => {

            await fixtureUsersDb.__drop();

            const passwords: [string, string, string] = ['123QWEasd!', '123QWEasd!', '123QWEasd!'];
            const hashes: [string, string, string] = await Promise.all(passwords.map(async (p) => await bcrypt.hash(p, 10))) as any;
            const ids: [string, string, string] = [uuid.v4(), uuid.v4(), uuid.v4()];


            for (let i = 0; i < 120; i++) {
                const id = uuid.v4();
                const email = `klient${i}@gmail.com`;
                const password = '123QWEasd!';
                const role = UserRole.User;
                const agreements = true;
                const hash = await bcrypt.hash(password, 10);
                const user: UserModel = {
                    _id: id,
                    email,
                    password: hash,
                    role,
                    agreements,
                    verification: {
                        isVerified: true,
                    },
                    stamps: {
                        amount: 0,
                        history: []
                    }
                }
                await fixtureUsersDb.setById<UserModel>(id, user);
            }

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

            for (let i = 0; i < 20; i++) {
                const id = uuid.v4();
                const email = `papiesz${i}@gmail.com`;
                const password = '123QWEasd!';
                const role = UserRole.Manager;
                const history: string[] = [];
                const agreements = true;
                const hash = await bcrypt.hash(password, 10);
                const manager: ManagerModel = {
                    _id: id,
                    email,
                    password: hash,
                    role,
                    history,
                    agreements,
                    verification: {
                        isVerified: true,
                    }
                }
                await fixtureManagersDb.setById<ManagerModel>(id, manager);
            }
            await fixtureManagersDb.setById<ManagerModel>(ids[0], {
                _id: ids[0],
                email: 'papiesz@gmail.com',
                password: hashes[0],
                role: UserRole.Manager,
                history: [],
                agreements: true,
                verification: {
                    isVerified: true,
                }
            });

            await fixtureManagersDb.setById<ManagerModel>(ids[1], {
                _id: ids[1],
                email: 'papiesz2@gmail.com',
                password: hashes[1],
                role: UserRole.Manager,
                history: [],
                agreements: true,
                verification: {
                    isVerified: true,
                }
            });

            await fixtureManagersDb.setById<ManagerModel>(ids[2], {
                _id: ids[2],
                email: 'papiesz3@gmail.com',
                password: hashes[2],
                role: UserRole.Manager,
                history: [],
                agreements: true,
                verification: {
                    isVerified: true,
                }
            });

        }

        const defaultAdmins = async () => {

            await fixtureAdminsDb.__drop();

            const passwords: [string, string, string] = ['123QWEasd!', '123QWEasd!', '123QWEasd!'];
            const hashes: [string, string, string] = await Promise.all(passwords.map(async (p) => await bcrypt.hash(p, 10))) as any;
            const ids: [string, string, string] = [uuid.v4(), uuid.v4(), uuid.v4()];

            await fixtureAdminsDb.setById<AdminModel>(ids[0], {
                _id: ids[0],
                email: 'pawel@gmail.com',
                password: hashes[0],
                role: UserRole.Admin,
                history: [],
                agreements: true,
                verification: {
                    isVerified: true,
                }
            });

            await fixtureAdminsDb.setById<AdminModel>(ids[1], {
                _id: ids[1],
                email: 'wel@gmail.com',
                password: hashes[1],
                role: UserRole.Admin,
                history: [],
                agreements: true,
                verification: {
                    isVerified: true,
                }
            });

            await fixtureAdminsDb.setById<AdminModel>(ids[2], {
                _id: ids[2],
                email: 'pa@gmail.com',
                password: hashes[2],
                role: UserRole.Admin,
                history: [],
                agreements: true,
                verification: {
                    isVerified: true,
                }
            });

        }

        const defaultConfig = async () => {

            await fixtureAppConfigDb.__drop();

            await fixtureAppConfigDb.setById<AppConfig>('appConfig', {
                cardSize: 7,
                discount: 15,
                stampsInRow: 4,
                maxCardsPerTransaction: 3
            })
        }

        await defaultConfig();
        await defaultUsers();
        await defaultManagers();
        await defaultAdmins();
        console.log("[3] Database instances populated");

        await recreateLogs();
        console.log("[4] Logs structure created");

    } catch (error) {
        console.error("Error while resetting database:", error);
    }

}

async function recreateLogs() {
    const logsPath = path.join(process.cwd(), "logs");
    await fs.rm(logsPath, { recursive: true, force: true });
    await fs.mkdir(logsPath, { recursive: true });
    Object.values(Logs.LogLocations).forEach(async (location) => {
        await fs.mkdir(path.join(logsPath, location), { recursive: true });
    });
}

dbFixtures();