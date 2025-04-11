import Logs from '../../LogService';
import DbStores from '../DbStores';
import { AdminModel, SanitizedAdminModel } from './AdminsDb.types';
import { ManagersDb } from './ManagersDb';
import { StampsHistoryEntry } from './UsersDb.types';

class AdminsDb extends ManagersDb {
    async getSanitizedAdminById(managerId: string) {
        return await Logs.appLogs.catchUnhandled('AdminsDb error on getSanitizedAdmingById', async () => {
            const manager = await this.getById<AdminModel>(managerId);
            if (manager) {
                const sanitizedUser: SanitizedAdminModel = {
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
        return await Logs.appLogs.catchUnhandled('AdminsDb error on setRelationToUserHistory', async () => {
            const manager = await this.getById<AdminModel>(managerId);
            if (manager) {
                const currentHistory = manager.transactionsHistory;
                let nextHistory: StampsHistoryEntry[] = [];
                if (currentHistory.length >= 50) {
                    nextHistory = [...(currentHistory.slice(-49)), historyEntry];
                } else {
                    nextHistory = [...currentHistory, historyEntry];
                }
                const updatedId = await this.updateById<AdminModel>(managerId, {
                    transactionsHistory: nextHistory
                })
                if (updatedId) {
                    return updatedId
                }
            }
        });
    }
}

const adminsDb = new AdminsDb({ dbStore: DbStores.Admins });
delete (adminsDb as any).getSanitizedManagerById;

export default adminsDb;