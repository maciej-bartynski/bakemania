import { SanitizedUserModel, StampsHistoryEntry, UserModel } from './UsersDb.types';
import Logs from '../../LogService';
import DbService from '../DbService';
import DbStores from '../DbStores';
import * as uuid from 'uuid';

class UsersDb extends DbService {
    async getSanitizedUserById(id: string) {
        return await Logs.appLogs.catchUnhandled('UsersDb error on getSanitizedUserById', async () => {
            const user = await this.getById<UserModel>(id);
            if (user) {
                const sanitizedUser: SanitizedUserModel = {
                    _id: user._id,
                    email: user.email,
                    stamps: user.stamps,
                    role: user.role,
                    agreements: user.agreements,
                    verification: {
                        isVerified: user.verification.isVerified,
                    },
                    card: !!user.card,
                }

                return sanitizedUser;
            }
        });
    }

    async changeStampsAndWriteHistory(userId: string, by: number, assistantId: string) {
        return await Logs.appLogs.catchUnhandled('UsersDb error on changeStampsAndWriteHistory', async () => {
            if (typeof by === 'number' && by === Math.floor(by)) {
                const updatedId = await this.changeStampsBy(userId, by);
                if (updatedId) {
                    const user = await this.getById<UserModel>(updatedId);
                    if (user) {
                        const newHistoryEntry: StampsHistoryEntry = {
                            _id: uuid.v4(),
                            by,
                            assistantId,
                            balance: user.stamps.amount,
                            createdAt: this.getFormattedDateString(new Date()),
                            userId: userId,
                        };
                        const entry = await this.setHistoryEntry(updatedId, newHistoryEntry);
                        if (entry) {
                            return entry;
                        }
                    }
                    return null;
                }
            }
        });
    }

    async changeStampsBy(userId: string, by: number) {
        return await Logs.appLogs.catchUnhandled('UsersDb error on changeStampsBy', async () => {
            const user = await this.getById<UserModel>(userId);
            if (user) {
                const currentStamps = user.stamps.amount;
                const newStamps = currentStamps + by;
                if (newStamps >= 0 && newStamps === Math.floor(newStamps)) {
                    const updatedId = await this.updateById<UserModel>(userId, {
                        stamps: {
                            ...user.stamps,
                            amount: newStamps
                        }
                    });
                    return updatedId;
                }
            }
        });
    }

    async setHistoryEntry(userId: string, entry: StampsHistoryEntry) {
        return await Logs.appLogs.catchUnhandled('UsersDb setHistoryEntry', async () => {
            const user = await this.getById<UserModel>(userId);
            if (user) {
                const currentHistory = user.stamps.history ?? [];
                let nextHistory: StampsHistoryEntry[] = [];
                if (currentHistory.length >= 50) {
                    nextHistory = [...(currentHistory.slice(-49)), entry];
                } else {
                    nextHistory = [...currentHistory, entry];
                }
                const updatedId = await this.updateById<UserModel>(userId, {
                    stamps: {
                        amount: user.stamps.amount,
                        history: nextHistory,
                    }
                });

                if (updatedId) {
                    return entry
                }
            }
        });
    }
}

const usersDb = new UsersDb({ dbStore: DbStores.Users });

export default usersDb;