import { SanitizedManagerModel, ManagerModel } from './ManagersDb.types';
import Logs from '../../LogService';
import DbService from '../DbService';
import DbStores from '../DbStores';
import { StampsHistoryEntry } from './UsersDb.types';

export class ManagersDb extends DbService {
    async getSanitizedManagerById(managerId: string) {
        return await Logs.appLogs.catchUnhandled('ManagersDb error on getSanitizedUserById', async () => {
            const manager = await this.getById<ManagerModel>(managerId);
            if (manager) {
                const sanitizedUser: SanitizedManagerModel = {
                    _id: manager._id,
                    email: manager.email,
                    role: manager.role,
                    transactionsHistory: manager.transactionsHistory,
                    agreements: manager.agreements,
                    verification: manager.verification
                }

                return sanitizedUser;
            }
        });
    }

    async setRelationToUserHistory(managerId: string, historyEntry: StampsHistoryEntry) {
        return await Logs.appLogs.catchUnhandled('ManagersDb error on setRelationToUserHistory', async () => {
            const manager = await this.getById<ManagerModel>(managerId);
            if (manager) {
                const currentHistory = manager.transactionsHistory;
                let nextHistory: StampsHistoryEntry[] = [];
                if (currentHistory.length >= 50) {
                    nextHistory = [...(currentHistory.slice(-49)), historyEntry];
                } else {
                    nextHistory = [...currentHistory, historyEntry];
                }
                const updatedId = await this.updateById<ManagerModel>(managerId, {
                    transactionsHistory: nextHistory
                })
                if (updatedId) {
                    return updatedId
                }
            }
        });
    }
}

const managersDb = new ManagersDb({ dbStore: DbStores.Managers });

export default managersDb;