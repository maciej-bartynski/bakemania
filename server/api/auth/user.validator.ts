import UserRole, { UserModel } from "../../services/DbService/instances/UsersDb.types";

const passwordValidator = (password: string): void | string => {

    try {
        if (typeof password !== 'string') {
            throw 'Hasło jest wymagane';
        }
        if (password.length < 8 || password.length > 50) {
            throw "Hasło musi mieć od 8 do 50 znaków";
        }
    } catch (e) {
        if (typeof e === 'string') {
            return e;
        } else {
            return 'Walidacja danych użytkownika nie powiodła się';
        }
    }
}
const userValidator = (fields: Partial<UserModel>): void | string => {
    const fieldsData = fields;

    try {
        if (!fieldsData || !(fieldsData instanceof Object)) {
            throw 'Brak danych użytkownika';
        }

        const allowedFields = ['email', 'password', 'role', 'stamps', '_id', 'card', 'agreements', 'verification'];
        const requiredFields = ['email', 'password', 'role', 'stamps', '_id', 'agreements', 'verification'];
        const keys = Object.keys(fieldsData);
        keys.forEach(key => {
            if (!allowedFields.includes(key)) {
                throw `Pole "${key}" jest niedozwolone.`;
            }
        });
        requiredFields.forEach(field => {
            if (!keys.includes(field)) {
                throw `Brakujące pole "${field}"`;
            }
        });

        const {
            email,
            password,
            role,
            stamps,
            _id,
            card,
            agreements,
            verification
        } = fieldsData;


        if (!(verification instanceof Object)) {
            throw 'Pole "verification" musi być obiektem';
        }

        if (typeof verification?.isVerified !== 'boolean') {
            throw 'Pole "verification.isVerified" musi być TRUE lub FALSE';
        }

        if (agreements !== true) {
            throw 'Aby używać aplikacji, musisz zaakceptować regulamin i politykę prywatności';
        }

        if (typeof _id !== 'string') {
            throw 'Brakujący _id';
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            throw 'E-mail oraz hasło są wymagane';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmail = emailRegex.test(email);

        if (!isEmail) {
            throw "Niepoprawny format email";
        }

        if (typeof role !== 'string') {
            throw 'Rola jest wymagana';
        }

        if (!(stamps instanceof Object)) {
            throw 'Pole "stamps" musi być obiektem';
        } else {
            if (Object.values(stamps).length !== 2) {
                throw 'Obiekt "stamps" zawiera błędną ilość pól';
            }

            if (typeof stamps.amount !== 'number') {
                throw 'Pole "stamps.amount" musi być cyfrą';
            } else {
                if (stamps.amount < 0) {
                    throw 'Pole "stamps.amount" nie może być mniejsze od zera';
                }

                if (stamps.amount - Math.floor(stamps.amount) !== 0) {
                    throw 'Pole "stamps.amount" musi być liczbą całkowitą';
                }
            }
        }

        if (card !== undefined) {
            if (!(card instanceof Object)) {
                throw 'Pole "card" musi być obiektem';
            } else {

                if (Object.values(card).length !== 2) {
                    throw 'Obiekt "card" zawiera błędną ilość pól';
                }

                if (typeof card.createdAt !== 'number') {
                    throw 'Pole "card.createdAt" musi być liczbą.';
                }

                if (!card.hash) {
                    throw 'Brak hasha w "card.hash"';
                }
            }
        }

        if (password.length < 8 || password.length > 50) {
            throw "Hasło musi mieć od 8 do 50 znaków";
        }

        if (!Object.values(UserRole).includes(role as UserRole)) {
            throw `Rola musi być jedną z wartości: ${Object.values(UserRole).join(', ')}`;
        }

    } catch (e) {
        if (typeof e === 'string') {
            return e;
        } else {
            return 'Walidacja danych użytkownika nie powiodła się';
        }
    }
}

export default {
    userValidator,
    passwordValidator
}
