import { SanitizedManagerModel, ManagerModel } from './ManagersDb.types';
import Logs from '../../LogService';
import DbService from '../DbService';
import DbStores from '../DbStores';

export class ManagersDb extends DbService {
    async getSanitizedManagerById(managerId: string) {
        return await Logs.appLogs.catchUnhandled('ManagersDb error on getSanitizedUserById', async () => {
            const manager = await this.getById<ManagerModel>(managerId);
            if (manager) {
                const sanitizedUser: SanitizedManagerModel = {
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
        return await Logs.appLogs.catchUnhandled('ManagersDb error on setRelationToUserHistory', async () => {
            const manager = await this.getById<ManagerModel>(managerId);
            if (manager) {
                const currentHistory = manager.history;
                let nextHistory: string[] = [];
                if (currentHistory.length >= 50) {
                    nextHistory = [...(currentHistory.slice(-49)), userId];
                } else {
                    nextHistory = [...currentHistory, userId];
                }
                const updatedId = await this.updateById<ManagerModel>(managerId, {
                    history: nextHistory
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