import fs from "fs";
import path from "path";
import { UserModel } from "../api/auth/user.types";


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

const subscriptionsFindOne = async (fields: {
    userId?: string
}): Promise<{ userId: string, endpoint: string, keys: { p256dh: string, auth: string } } | undefined> => {

    const directoryPath = 'db/sessions';
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        if (fs.statSync(filePath).isFile() && file.endsWith('.json')) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(fileContent);
            if (jsonData.userId === fields.userId) {
                return jsonData;
            }
        }
    }

}

export default {
    usersFindOne,
    subscriptionsFindOne
}