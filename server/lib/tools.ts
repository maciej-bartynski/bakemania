import fs from "fs";
import path from "path";
import { SanitizedUserModel, UserCard, UserModel } from "../services/DbService/instances/UsersDb.types";
import bcrypt from 'bcryptjs';
import usersDb from "../services/DbService/instances/UsersDb";
import managersDb from "../services/DbService/instances/ManagersDb";
import { ManagerModel, SanitizedManagerModel } from "../services/DbService/instances/ManagersDb.types";
import adminsDb from "../services/DbService/instances/AdminsDb";
import { AdminModel, SanitizedAdminModel } from "../services/DbService/instances/AdminsDb.types";


const usersFindOne = async (fields: {
    _id?: string,
    email?: string
}): Promise<UserModel | void> => {

    const directoryPath = 'db/users';
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        if (fs.statSync(filePath).isFile() && file.endsWith('.json')) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(fileContent);
            if (jsonData.email === fields.email || jsonData._id === fields._id) {
                return jsonData as UserModel;
            }
        }
    }

}

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

export default {
    usersFindOne,
    validateCard,
    createCardId,
    validateCardIssuedDate,
    getSanitizedUserOrAssistantById,
    getUserOrAssistantById,
    getUserOrAssistantByEmail
}