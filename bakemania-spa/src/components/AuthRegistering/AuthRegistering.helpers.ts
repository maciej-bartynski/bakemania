type RegistrationState = {
    email: {
        value: string;
        error: string;
        touched: boolean;
    };
    password: {
        value: string;
        error: string;
        touched: boolean;
    };
    confirmPassword: {
        value: string;
        error: string;
        touched: boolean;
    };
    agreements: {
        value: boolean;
        error: string;
        touched: boolean;
    };
};

type RegistrationAction = {
    type: 'email' | 'password' | 'touch-email' | 'touch-password' | 'confirm' | 'touch-confirm' | 'agreements' | 'reset',
    value: string | boolean | undefined
} & (
        {
            type: 'agreements',
            value: boolean
        } | {
            type: 'email' | 'password' | 'touch-email' | 'touch-password' | 'confirm' | 'touch-confirm',
            value: string
        } | {
            type: 'reset',
            value: undefined
        }
    );

const registrationState: RegistrationState = {
    email: {
        value: '',
        error: 'Email jest wymagany.',
        touched: false,
    },
    password: {
        value: '',
        error: 'Hasło jest wymagane.',
        touched: false
    },
    confirmPassword: {
        value: '',
        error: 'Potwierdź swoje hasło.',
        touched: false
    },
    agreements: {
        value: false,
        error: 'Musisz zaakceptować regulamin i politykę prywatności.',
        touched: false
    }
};

function registrationReducer(
    state: typeof registrationState,
    action: RegistrationAction
) {
    switch (action.type) {
        case 'reset': {
            return registrationState;
        }
        case 'agreements': {
            return {
                ...state,
                agreements: {
                    ...state.agreements,
                    touched: true,
                    value: action.value,
                    error: action.value ? '' : 'Musisz zaakceptować regulamin i politykę prywatności.',
                }
            };
        }
        case 'touch-confirm': {
            return {
                ...state,
                confirmPassword: {
                    ...state.confirmPassword,
                    touched: true,
                }
            }
        }
        case 'confirm': {
            if (action.value !== state.password.value) {
                return {
                    ...state,
                    confirmPassword: {
                        ...state.confirmPassword,
                        value: action.value,
                        error: 'Hasła nie pasują do siebie.',
                    }
                }
            }
            return {
                ...state,
                confirmPassword: {
                    ...state.confirmPassword,
                    value: action.value,
                    error: '',
                }
            }
        }
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

            if (password.length < 8 || password.length > 50) {
                errors.push("mieć od 8 do 50 znaków");
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

            const confirmField = state.confirmPassword;

            if (confirmField.value !== password) {
                confirmField.error = 'Hasła nie pasują do siebie.';
            } else {
                confirmField.error = '';
            }

            if (errors.length === 0) {
                return {
                    ...state,
                    confirmPassword: confirmField,
                    password: {
                        ...state.password,
                        value: password,
                        error: ''
                    }
                }
            } else {
                return {
                    ...state,
                    confirmPassword: confirmField,
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