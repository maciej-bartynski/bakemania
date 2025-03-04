import Tools from '../../lib/tools';
import fs from 'fs';

const STAMPS_DB_PATH = 'db/stamps';
const USERS_DB_PATH = 'db/users';


// const stampsFindOne = async (userId: string): Promise<Stamps | undefined> => {

//     const filePath = `${STAMPS_DB_PATH}/${userId}.json`;

//     try {
//         const fileContent = fs.readFileSync(filePath, 'utf8');
//         const jsonData = JSON.parse(fileContent);
//         const stampsData = new Stamps(jsonData);
//         return stampsData;
//     } catch (error) {
//         return undefined;
//     }

// }

const stampsIncrementOne = async (fields: {
    userId: string,
    amount: number
}): Promise<string> => {

    const { userId, amount } = fields;
    const user = await Tools.usersFindOne({ _id: userId, email: undefined });

    try {
        const filePath = `${USERS_DB_PATH}/${userId}.json`;
        const newStampsData = user.stamps.amount + amount;
        const newUser = { ...user };
        newUser.stamps = newStampsData;
        fs.writeFileSync(filePath, JSON.stringify(newUser, null, 2));
    } catch (error) {
        console.log(error);
    }

    return userId;
}

const stampsDecrementOne = async (fields: {
    userId: string,
    amount: number
}): Promise<string> => {

    const { userId, amount } = fields;

    const user = await Tools.usersFindOne({ _id: userId, email: undefined });

    try {
        const filePath = `${USERS_DB_PATH}/${userId}.json`;
        const newStampsData = user.stamps.amount - amount;
        const newUser = { ...user };

        if (newStampsData < 0) {
            throw 'Not enough stamps';
        } else {
            newUser.stamps = newStampsData;
            fs.writeFileSync(filePath, JSON.stringify(newUser, null, 2));
        }
    } catch (error) {
        console.log(error);
    }

    return userId;
}

export default {
    // stampsFindOne,
    stampsIncrementOne,
    stampsDecrementOne
}