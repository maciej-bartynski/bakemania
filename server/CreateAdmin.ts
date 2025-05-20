import { AdminModel } from "./services/DbService/instances/AdminsDb.types";
import UserRole from "./services/DbService/instances/UsersDb.types";
import * as uuid from 'uuid';
import bcrypt from 'bcryptjs';
import adminsDb from "./services/DbService/instances/AdminsDb";
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const defaultAdmins = async (email: string, password: string) => {
    const hash: string = await bcrypt.hash(password, 10);

    const adminId = uuid.v4();
    await adminsDb.setById<AdminModel>(adminId, {
        _id: adminId,
        email,
        password: hash,
        role: UserRole.Admin,
        transactionsHistory: [],
        agreements: true,
        verification: {
            isVerified: true,
        }
    });
}

const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

const main = async () => {
    try {
        const email = await askQuestion('Podaj email admina: ');
        const password = await askQuestion('Podaj hasło admina: ');

        await defaultAdmins(email, password);
        console.log('Admin został utworzony pomyślnie.');
    } catch (error) {
        console.error('Wystąpił błąd podczas tworzenia admina:', error);
    } finally {
        rl.close();
    }
};

main();