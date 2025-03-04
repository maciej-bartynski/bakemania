import { FC, useCallback, useEffect, useReducer, useState } from "react";
import './SplashScreen.css';
import meActions from "../storage/me/me-actions";
import useAppDispatch from "../storage/useAppDispatch";
import useMeSelector from "../storage/me/me-selectors";
import ReducerState from "../storage/types";
import splashScreenHelpers from "./SplashScreen.helpers";
import DashboardScreen from "../DashboardScreen/DashboardScreen";
import AssistantSection from "../AssistantSection/AssistantSection";
import { noticesStore } from "../storage/notices-store";
import noticesSlice from "../storage/notices/notices-reducer";
import * as uuid from 'uuid';
import meSlice from "../storage/me/me-reducer";
import SafeAreaView from "../atoms/SafeAreaView/SafeAreaView";
import Background from "../atoms/Background/Background";

const SplashScreen: FC = () => {

    const dispatch = useAppDispatch();

    const {
        me,
        status,
        error
    } = useMeSelector();

    const [activeSection, setActiveSection] = useState('login');

    const isIdle = (status !== ReducerState.Fetching);

    /**
     * Login form
     */
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordTouched, setPasswordTouched] = useState(false);

    const onSetEmail = useCallback((emailInput: HTMLInputElement) => {
        setEmail(emailInput.value.trim());
        const isValid = emailInput.checkValidity();
        setEmailError(isValid ? "" : 'Niepoprawny adres e-mail.');
    }, [setEmail]);

    const onSetPassword = useCallback((passwordInput: HTMLInputElement) => {
        const password = passwordInput.value;
        setPassword(password);
        if (password.trim() !== password) {
            setPasswordError('Hasło nie może zawierać spacji.')
        } else {
            setPasswordError("");
        }
    }, [setPassword]);

    const logIn = useCallback(async () => {
        dispatch(meActions.logIn({ email, password }));
    }, [email, password, dispatch]);

    const logOut = useCallback(async () => {
        setActiveSection('login');
        if (window.localStorage.getItem('token')) {
            dispatch(meActions.logOut());
        }
    }, [dispatch]);

    /**
     * Register form
     */

    const [registrationFormState, registrationFormDispatch] = useReducer(
        splashScreenHelpers.registrationReducer,
        splashScreenHelpers.registrationState
    );

    function setRegistrationEmail(e: React.ChangeEvent<HTMLInputElement>): void {
        registrationFormDispatch({ type: 'email', value: e.target.value });
    }

    function setRegistrationPassword(e: React.ChangeEvent<HTMLInputElement>): void {
        registrationFormDispatch({ type: 'password', value: e.target.value });
    }

    function setRegistrationEmailTouched(): void {
        registrationFormDispatch({ type: 'touch-email', value: '' });
    }

    function setRegistrationPasswordTouched(): void {
        registrationFormDispatch({ type: 'touch-password', value: '' });
    }

    const register = useCallback(async () => {
        dispatch(meActions.register({
            email: registrationFormState.email.value,
            password: registrationFormState.password.value,
        }));
    }, [registrationFormState, dispatch]);

    useEffect(() => {
        async function init(): Promise<void> {
            const token = window.localStorage.getItem('token');
            if (token) {
                await dispatch(meActions.fetchMe());
            } else {
                logOut();
            }
        }
        init();
    }, [dispatch, logOut]);

    useEffect(() => {
        if (error) {
            const _id = uuid.v4();
            noticesStore.dispatch(noticesSlice.actions.addNotice({
                _id,
                header: 'Storage error',
                body: error,
            }));

            dispatch(meSlice.actions.clearError());
        }
    }, [error, dispatch]);

    let toRender = (
        <Background>
            <div className="splashScreen">
                <section className={activeSection === 'register' ? '--active' : ''}>
                    <div className="horizontal-line">
                        <span>
                            Masz już konto <strong>bakeMAnia</strong>?
                        </span>
                        <button
                            className='secondary'
                            disabled={!isIdle}
                            type="button"
                            onClick={() => setActiveSection('login')}
                        >
                            Przejdź do logowania
                        </button>
                        <span>
                            Nie mam konta, chcę dołączyć:
                        </span>
                    </div>
                    <form
                        className="splashScreen__register-form"
                        onSubmit={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            register();
                        }}
                    >

                        <div className={`splashScreen__fieldset ${registrationFormState.email.touched && registrationFormState.email.error ? "--error" : ""}`}>
                            <label>
                                <input
                                    type="email"
                                    autoComplete="username"
                                    placeholder="Wpisz swój e-mail"
                                    onChange={setRegistrationEmail}
                                    disabled={!isIdle}
                                    onBlur={setRegistrationEmailTouched}
                                />
                            </label>

                            <div className="splashScreen__error">
                                {registrationFormState.email.touched && (
                                    registrationFormState.email.error
                                )}
                            </div>
                        </div>

                        <div className={`splashScreen__fieldset ${registrationFormState.password.touched && registrationFormState.password.error ? "--error" : ""}`}>
                            <label>

                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="Ustaw hasło (min. 8 znaków)"
                                    onChange={setRegistrationPassword}
                                    disabled={!isIdle}
                                    onBlur={setRegistrationPasswordTouched}
                                />
                            </label>
                            <div className="splashScreen__error">
                                {registrationFormState.password.touched && (
                                    registrationFormState.password.error
                                )}
                            </div>
                        </div>

                        <button
                            disabled={!isIdle || !!registrationFormState.email.error || !!registrationFormState.password.error}
                            type="submit"
                        >
                            Rejestruję się
                        </button>
                    </form>
                </section>



                <section className={activeSection === 'login' ? '--active' : ''}>
                    <div className="horizontal-line">
                        <span>
                            Dołącz do klubu <strong>bakeMAnia</strong>
                        </span>
                        <button
                            className='secondary'
                            disabled={!isIdle}
                            type="button"
                            onClick={() => setActiveSection('register')}
                        >
                            Załóż konto
                        </button>
                        <span>
                            A jeśli masz już konto:
                        </span>
                    </div>
                    <form
                        className="splashScreen__login-form"
                        onSubmit={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            logIn();
                        }}
                    >

                        <div className={`splashScreen__fieldset ${emailTouched && emailError ? "--error" : ""}`}>
                            <label>
                                <input
                                    type="email"
                                    autoComplete="username"
                                    placeholder="E-mail"
                                    onChange={(e) => {
                                        onSetEmail(e.target);
                                    }}
                                    disabled={!isIdle}
                                    onBlur={() => setEmailTouched(true)}
                                />
                            </label>

                            <div className="splashScreen__error">
                                {emailTouched && emailError && (
                                    emailError
                                )}
                            </div>
                        </div>

                        <div className={`splashScreen__fieldset ${passwordTouched && passwordError ? "--error" : ""}`}>
                            <label>

                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="Hasło (min. 8 znaków)"
                                    onChange={(e) => {
                                        onSetPassword(e.target);
                                    }}
                                    disabled={!isIdle}
                                    onBlur={() => setPasswordTouched(true)}
                                />
                            </label>
                            <div className="splashScreen__error">
                                {passwordTouched && passwordError && (
                                    passwordError
                                )}
                            </div>
                        </div>

                        <button
                            disabled={!isIdle || !email || !password || !!emailError || !!passwordError}
                            type="submit"
                        >
                            Zaloguj się
                        </button>

                    </form>
                </section>
            </div>
        </Background>
    )

    if (me) {
        if (me.role != 'user') {
            toRender = (
                <AssistantSection
                    assistant={me}
                />
            )
        } else {
            toRender = (
                <DashboardScreen
                    me={me}
                    logOut={logOut}
                />
            )
        }
    }

    return (
        <SafeAreaView>
            {toRender}
        </SafeAreaView>
    )
}

export default SplashScreen;