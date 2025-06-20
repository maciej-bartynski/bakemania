import Logs from '../../LogService';
import DbStores from '../DbStores';
import { AdminModel, SanitizedAdminModel } from './AdminsDb.types';
import { ManagersDb } from './ManagersDb';
import { StampsHistoryEntry } from './UsersDb.types';

class AdminsDb extends ManagersDb {
    async getSanitizedAdminById(managerId: string) {
        return await Logs.appLogs.catchUnhandled('AdminsDb error on getSanitizedAdmingById', async () => {
            const manager = await this.getByIdSilent<AdminModel>(managerId);
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
}

const adminsDb = new AdminsDb({ dbStore: DbStores.Admins });
delete (adminsDb as any).getSanitizedManagerById;

export default adminsDb;