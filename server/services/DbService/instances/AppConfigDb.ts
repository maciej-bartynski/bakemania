import DbStores from '../DbStores';
import { ManagersDb } from './ManagersDb';

class AppConfigDb extends ManagersDb { }

const appConfigDb = new AppConfigDb({ dbStore: DbStores.AppConfig });
delete (appConfigDb as any).getSanitizedManagerById;

export default appConfigDb;