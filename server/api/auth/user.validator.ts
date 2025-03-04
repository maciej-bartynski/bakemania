import UserRole, { UserModel } from "./user.types";

const userValidator = (fields: Partial<UserModel>): void | string => {
    const fieldsData: any = fields;

    try {
        if (!fieldsData || !(fieldsData instanceof Object)) {
            throw 'Brak danych użytkownika';
        }

        const allowedFields = ['email', 'password', 'role', 'stamps', '_id'];
        const requiredFields = ['email', 'password', 'role', 'stamps', '_id'];
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
            _id
        } = fieldsData;

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
            if (Object.values(stamps).length !== 1) {
                throw 'Obiekt "stamps" zawiera niedozwolone pola';
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

        if (password.length < 8 || password.length > 16) {
            console.log("p", password)
            throw "Hasło musi mieć od 8 do 16 znaków";
        }
        if (!/[A-Z]/.test(password)) {
            throw "Hasło musi zawierać przynajmniej jedną wielką literę";
        }
        if (!/[a-z]/.test(password)) {
            throw "Hasło musi zawierać przynajmniej jedną małą literę";
        }
        if (!/\d/.test(password)) {
            throw "Hasło musi zawierać przynajmniej jedną cyfrę";
        }
        if (!/[\W_]/.test(password)) {
            throw "Hasło musi zawierać przynajmniej jeden znak specjalny";
        }
        if (/\s/.test(password)) {
            throw "Hasło nie może zawierać spacji";
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

export default userValidator
