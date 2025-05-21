type RegistrationState = {
    username: {
        value: string;
        error: string;
        touched: boolean;
    };
    ['new-password']: {
        value: string;
        error: string;
        touched: boolean;
    };
    ['confirm-new-password']: {
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
    type: 'username' | 'new-password' | 'touch-username' | 'touch-new-password' | 'confirm-new-password' | 'touch-confirm-new-password' | 'agreements' | 'reset',
    value: string | boolean | undefined
} & (
        {
            type: 'agreements',
            value: boolean
        } | {
            type: 'username' | 'new-password' | 'touch-username' | 'touch-new-password' | 'confirm-new-password' | 'touch-confirm-new-password',
            value: string
        } | {
            type: 'reset',
            value: undefined
        }
    );

const registrationState: RegistrationState = {
    username: {
        value: '',
        error: 'Email jest wymagany.',
        touched: false,
    },
    ['new-password']: {
        value: '',
        error: 'Hasło jest wymagane.',
        touched: false
    },
    ['confirm-new-password']: {
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
        case 'touch-confirm-new-password': {
            return {
                ...state,
                ['confirm-new-password']: {
                    ...state['confirm-new-password'],
                    touched: true,
                }
            }
        }
        case 'confirm-new-password': {
            if (action.value !== state['new-password'].value) {
                return {
                    ...state,
                    ['confirm-new-password']: {
                        ...state['confirm-new-password'],
                        value: action.value,
                        error: 'Hasła nie pasują do siebie.',
                    }
                }
            }
            return {
                ...state,
                ['confirm-new-password']: {
                    ...state['confirm-new-password'],
                    value: action.value,
                    error: '',
                }
            }
        }
        case 'touch-username': {
            return {
                ...state,
                email: {
                    ...state.username,
                    touched: true,
                }
            }
        }
        case 'touch-new-password': {
            return {
                ...state,
                password: {
                    ...state['new-password'],
                    touched: true,
                }
            }
        }
        case 'username': {
            const { value: email } = action;
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmail = regex.test(email);
            if (isEmail) {
                return {
                    ...state,
                    username: {
                        ...state.username,
                        value: email,
                        error: ''
                    }
                }
            } else {
                return {
                    ...state,
                    username: {
                        ...state.username,
                        value: email,
                        error: 'Format e-maila powinen przypominać: uzytkownik@domena.pl'
                    }
                }
            }
        }
        case 'new-password': {
            const { value: password } = action;

            const errors = [];

            if (password.length < 8 || password.length > 50) {
                errors.push("mieć od 8 do 50 znaków");
            }

            const confirmField = state['confirm-new-password'];

            if (confirmField.value !== password) {
                confirmField.error = 'Hasła nie pasują do siebie.';
            } else {
                confirmField.error = '';
            }

            if (errors.length === 0) {
                return {
                    ...state,
                    confirmPassword: confirmField,
                    ['new-password']: {
                        ...state['new-password'],
                        value: password,
                        error: ''
                    }
                }
            } else {
                return {
                    ...state,
                    ['confirm-new-password']: confirmField,
                    ['new-password']: {
                        ...state['new-password'],
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