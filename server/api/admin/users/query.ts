import path from 'path';
import fs from 'fs';
import { UserModel } from '../../auth/user.types';

const dbPath = 'db/users';

const getUsers = (): UserModel[] | void => {
    try {
        const files = fs.readdirSync(dbPath);
        const users = [];

        for (const file of files) {
            const filePath = path.join(dbPath, file);
            if (fs.statSync(filePath).isFile() && file.endsWith('.json')) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const jsonData: UserModel = JSON.parse(fileContent);
                users.push(jsonData);
            }
        }

        return users;
    } catch (e) {
        return;
    }
}

const usersQueryForAdmin = {
    getUsers
}

export default usersQueryForAdmin;