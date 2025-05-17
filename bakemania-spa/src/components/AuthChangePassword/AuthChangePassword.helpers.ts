type RegistrationState = {

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

};

type RegistrationAction = {
    type: 'password' | 'touch-password' | 'confirm' | 'touch-confirm' | 'reset',
    value: string | undefined
} & (
        {
            type: 'password' | 'touch-password' | 'confirm' | 'touch-confirm',
            value: string
        } | {
            type: 'reset',
            value: undefined
        }
    );

const registrationState: RegistrationState = {
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
};

function registrationReducer(
    state: typeof registrationState,
    action: RegistrationAction
) {
    switch (action.type) {
        case 'reset': {
            return registrationState;
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
        case 'touch-password': {
            return {
                ...state,
                password: {
                    ...state.password,
                    touched: true,
                }
            }
        }
        case 'password': {
            const { value: password } = action;

            const errors = [];

            if (password.length < 8 || password.length > 50) {
                errors.push("mieć od 8 do 50 znaków");
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