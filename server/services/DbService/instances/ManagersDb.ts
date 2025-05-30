import { SanitizedManagerModel, ManagerModel } from './ManagersDb.types';
import Logs from '../../LogService';
import DbService from '../DbService';
import DbStores from '../DbStores';
import { StampsHistoryEntry } from './UsersDb.types';

export class ManagersDb extends DbService {
    async getSanitizedManagerById(managerId: string) {

        return await Logs.appLogs.catchUnhandled('ManagersDb error on getSanitizedUserById', async () => {
            const manager = await this.getByIdSilent<ManagerModel>(managerId);
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

}

const managersDb = new ManagersDb({ dbStore: DbStores.Managers });

export default managersDb;