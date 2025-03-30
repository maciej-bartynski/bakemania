import UserRole, { SanitizedUserModel, UserCard, UserModel } from "../services/DbService/instances/UsersDb.types";
import bcrypt from 'bcryptjs';
import usersDb from "../services/DbService/instances/UsersDb";
import managersDb from "../services/DbService/instances/ManagersDb";
import { ManagerModel, SanitizedManagerModel } from "../services/DbService/instances/ManagersDb.types";
import adminsDb from "../services/DbService/instances/AdminsDb";
import { AdminModel, SanitizedAdminModel } from "../services/DbService/instances/AdminsDb.types";

const createCardId = async (): Promise<UserCard> => {
    const cardIssueTimestamp = new Date().getTime();
    return {
        hash: await bcrypt.hash(`${cardIssueTimestamp}`, 10),
        createdAt: cardIssueTimestamp
    }
}

const validateCard = async (storedCard: UserCard, requestHash: string) => {
    const { createdAt, hash } = storedCard;
    if (requestHash === hash) {
        return validateCardIssuedDate(createdAt);
    }
    else return false;
}

const validateCardIssuedDate = (createdAt: number) => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000); // Odejmujemy 30 dni w milisekundach
    const isCardStillValid = (createdAt >= thirtyDaysAgo) && (createdAt <= now);
    return isCardStillValid;
}

const getSanitizedUserOrAssistantById = async (id: string): Promise<SanitizedManagerModel | SanitizedUserModel | SanitizedAdminModel | null> => {
    const user = await usersDb.getSanitizedUserById(id);
    if (user) {
        return user;
    }

    const manager = await managersDb.getSanitizedManagerById(id);
    if (manager) {
        return manager;
    }


    const admin = await adminsDb.getSanitizedAdminById(id);
    if (admin) {
        return admin;
    }

    return null;
}

const getUserOrAssistantById = async (id: string): Promise<ManagerModel | UserModel | AdminModel | null> => {
    const user = await usersDb.getById<UserModel>(id);
    if (user) {
        return user;
    }

    const manager = await managersDb.getById<ManagerModel>(id);
    if (manager) {
        return manager;
    }

    const admin = await adminsDb.getById<AdminModel>(id);
    if (admin) {
        return admin;
    }


    return null;
}


const getUserOrAssistantByEmail = async (email: string): Promise<ManagerModel | UserModel | AdminModel | null> => {
    const user = await usersDb.getAllByField<UserModel>('email', email);
    if (user[0]) {
        return user[0];
    }

    const manager = await managersDb.getAllByField<ManagerModel>('email', email);
    if (manager[0]) {
        return manager[0];
    }

    const admin = await adminsDb.getAllByField<AdminModel>('email', email);
    if (admin[0]) {
        return admin[0];
    }


    return null;
}

const removeUserOrAssistangById = async (id: string) => {
    const user = await getUserOrAssistantById(id);
    console.log('czy odnalazl sie taki user:', user);
    if (user?.role === UserRole.User) {
        return usersDb.removeItemById(id);
    }

    if (user?.role === UserRole.Manager) {
        return managersDb.removeItemById(id);
    }

    if (user?.role === UserRole.Admin) {
        return adminsDb.removeItemById(id);
    }

    return null;
}

const updarteUserOrAssistangById = async (id: string, fields: Partial<UserModel | ManagerModel | AdminModel>) => {
    const user = await getUserOrAssistantById(id);
    if (user?.role === UserRole.User) {
        return usersDb.updateById<UserModel>(id, fields as Partial<UserModel>);
    }

    if (user?.role === UserRole.Manager) {
        return managersDb.updateById<ManagerModel>(id, fields as Partial<ManagerModel>);
    }

    if (user?.role === UserRole.Admin) {
        return adminsDb.updateById<AdminModel>(id, fields as Partial<AdminModel>);
    }

    return null;
}

export default {
    validateCard,
    createCardId,
    validateCardIssuedDate,
    getSanitizedUserOrAssistantById,
    getUserOrAssistantById,
    getUserOrAssistantByEmail,
    removeUserOrAssistangById,
    updarteUserOrAssistangById
}