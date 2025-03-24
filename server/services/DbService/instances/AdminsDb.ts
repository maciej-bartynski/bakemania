import { SanitizedManagerModel, ManagerModel } from './ManagersDb.types';
import Logs from '../../LogService';
import DbService from '../DbService';
import DbStores from '../DbStores';
import { AdminModel, SanitizedAdminModel } from './AdminsDb.types';
import { ManagersDb } from './ManagersDb';

const Xx = Object.getPrototypeOf(ManagersDb);

class AdminsDb extends ManagersDb {
    async getSanitizedAdminById(managerId: string) {
        return await Logs.appLogs.catchUnhandled('AdminsDb error on getSanitizedAdmingById', async () => {
            const manager = await this.getById<AdminModel>(managerId);
            if (manager) {
                const sanitizedUser: SanitizedAdminModel = {
                    _id: manager._id,
                    email: manager.email,
                    role: manager.role,
                    history: manager.history,
                    agreements: manager.agreements,
                }

                return sanitizedUser;
            }
        });
    }



    async setRelationToUserHistory(managerId: string, userId: string) {
        return await Logs.appLogs.catchUnhandled('AdminsDb error on setRelationToUserHistory', async () => {
            const manager = await this.getById<AdminModel>(managerId);
            if (manager) {
                const currentHistory = manager.history;
                let nextHistory: string[] = [];
                if (currentHistory.length >= 50) {
                    nextHistory = [...(currentHistory.slice(-49)), userId];
                } else {
                    nextHistory = [...currentHistory, userId];
                }
                const updatedId = await this.updateById<AdminModel>(managerId, {
                    history: nextHistory
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