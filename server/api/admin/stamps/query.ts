import tools from "../../../lib/tools";
import fs from 'fs';

const USERS_DB_PATH = 'db/users';

const stampsChangeAmount = async (fields: {
    userId: string,
    amount: number
}): Promise<string | void> => {

    const { userId, amount } = fields;
    const user = await tools.usersFindOne({ _id: userId, email: undefined });

    if (!user) {
        throw 'User not found';
    }

    try {
        if (amount < 0) {
            throw 'Amount must be greater than 0';
        }
        user.stamps.amount = amount;
        const filePath = `${USERS_DB_PATH}/${userId}.json`;
        fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
        return userId;
    } catch (error) {
        console.log(error);
        return;
    }
}

const stampsQueryForAdmin = {
    stampsChangeAmount
}

export default stampsQueryForAdmin;