const registrationState = {
    email: {
        value: '',
        error: 'Email jest wymagany.',
        touched: false,
    },
    password: {
        value: '',
        error: 'Hasło jest wymagane.',
        touched: false
    }
};

function registrationReducer(
    state: typeof registrationState,
    action: {
        type: 'email' | 'password' | 'touch-email' | 'touch-password',
        value: string
    }
) {
    switch (action.type) {
        case 'touch-email': {
            return {
                ...state,
                email: {
                    ...state.email,
                    touched: true,
                }
            }
        }
        case 'touch-password': {
            return {
                ...state,
                password: {
                    ...state.password,
                    touched: true,
                }
            }
        }
        case 'email': {
            const { value: email } = action;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmail = regex.test(email);
            if (isEmail) {
                return {
                    ...state,
                    email: {
                        ...state.email,
                        value: email,
                        error: ''
                    }
                }
            } else {
                return {
                    ...state,
                    email: {
                        ...state.email,
                        value: email,
                        error: 'Format e-maila powinen przypominać: uzytkownik@domena.pl'
                    }
                }
            }
        }
        case 'password': {
            const { value: password } = action;

            const errors = [];

            if (password.length < 8 || password.length > 16) {
                errors.push("mieć od 8 do 16 znaków");
            }
            if (!/[A-Z]/.test(password)) {
                errors.push("zawierać przynajmniej jedną wielką literę");
            }
            if (!/[a-z]/.test(password)) {
                errors.push("zawierać przynajmniej jedną małą literę");
            }
            if (!/\d/.test(password)) {
                errors.push("zawierać przynajmniej jedną cyfrę");
            }
            if (!/[\W_]/.test(password)) {
                errors.push("zawierać przynajmniej jeden znak specjalny");
            }
            if (/\s/.test(password)) {
                errors.push("być bez spacji");
            }

            if (errors.length === 0) {
                return {
                    ...state,
                    password: {
                        ...state.password,
                        value: password,
                        error: ''
                    }
                }
            } else {
                return {
                    ...state,
                    password: {
                        ...state.password,
                        value: password,
                        error: errors.length > 1 ? `Hasło musi: ${errors.join(', ')}.` : `Hasło musi ${errors.join('')}.`
                    }
                }
            }
        }
    }
}

const splashScreenHelpers = {
    registrationReducer,
    registrationState
}

export default splashScreenHelpers;