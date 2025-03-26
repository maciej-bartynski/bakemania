import { FC, useCallback, useEffect, useReducer, useRef, useState } from "react"
import './Authorization.css'
import authHelpers from "./Authorization.helpers";
import meActions from "../../storage/me/me-actions";
import useAppDispatch from "../../storage/useAppDispatch";
import ReducerState from "../../storage/types";
import useMeSelector from "../../storage/me/me-selectors";

const Authorization: FC = () => {
    const dispatch = useAppDispatch();
    const { status } = useMeSelector();
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

    /**
     * Register form
     */

    const [registrationFormState, registrationFormDispatch] = useReducer(
        authHelpers.registrationReducer,
        authHelpers.registrationState
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

    function setRegistrationConfirmPasswordTouched(): void {
        registrationFormDispatch({ type: 'touch-confirm', value: '' });
    }

    function setAgreements(e: React.ChangeEvent<HTMLInputElement>): void {
        const checked = e.target.checked;
        registrationFormDispatch({ type: 'agreements', value: checked });
    }

    function setRegistrationConfirmPassword(e: React.ChangeEvent<HTMLInputElement>): void {
        registrationFormDispatch({ type: 'confirm', value: e.target.value });
    }

    const [missingCaptchaAlert, setMissingCaptchaAlert] = useState(false);

    const register = useCallback(async () => {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const captchaToken = (window as any).grecaptcha?.getResponse();

        if (!captchaToken) {
            setMissingCaptchaAlert(true);
            alert('Proszę zaznaczyć weryfikację reCaptcha');
            return;
        } else {
            setMissingCaptchaAlert(false);
        }

        if (registrationFormState.password.value !== registrationFormState.confirmPassword.value) {
            alert('Hasła nie pasują do siebie!');
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).grecaptcha?.reset();

        await dispatch(meActions.register({
            email: registrationFormState.email.value,
            password: registrationFormState.password.value,
            agreements: registrationFormState.agreements.value,
            captchaToken,
        }));

    }, [registrationFormState, dispatch]);

    const [captchaLoaded, setCaptchaLoaded] = useState(false);

    const scriptRef = useRef<HTMLScriptElement | null>(null);
    const captchaRenderingWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let isUnmounted = false;

        const loadCaptchaScript = () => {
            scriptRef.current = document.createElement('script');
            scriptRef.current.id = 'google-recaptcha';
            scriptRef.current.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
            scriptRef.current.async = true;
            scriptRef.current.defer = true;
            scriptRef.current.onload = () => {
                if (isUnmounted) return;
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (window as any).grecaptcha?.ready(function () {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (window as any).grecaptcha?.render('g-recaptcha', {
                            sitekey: import.meta.env.VITE_CAPTCHA_SECRET_KEY
                        });
                    });
                    setCaptchaLoaded(true);
                } catch (error) {
                    alert('Błąd renderowania captchy:' + error);
                }
            };

            document.head.appendChild(scriptRef.current);
        };

        loadCaptchaScript();

        const captchaWrapper = captchaRenderingWrapperRef.current;
        return () => {
            isUnmounted = true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).grecaptcha;
            if (scriptRef.current) {
                document.head.removeChild(scriptRef.current);
            }
            if (captchaWrapper) {
                captchaWrapper.innerHTML = '';
            }
        }
    }, []);

    if (!captchaLoaded) {
        return (
            <div className="authorization">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',

                }}>
                    <span>Ładowanie captcha...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="authorization">
            <section className={activeSection === 'register' ? '--active' : ''}>
                <div className="horizontal-line">
                    <span className="horizontal-line__question">
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
                    <span className="horizontal-line__answer">
                        Nie mam konta, chcę dołączyć:
                    </span>

                </div>
                <form
                    className="authorization__register-form"
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        register();
                    }}
                >
                    <div className={`authorization__fieldset ${registrationFormState.email.touched && registrationFormState.email.error ? "--error" : ""}`}>
                        <label>
                            <input
                                type="email"
                                placeholder="Wpisz swój e-mail"
                                onChange={setRegistrationEmail}
                                disabled={!isIdle}
                                onBlur={setRegistrationEmailTouched}
                                autoComplete="off"
                            />
                            <span className="authorization__hint">Błędny adres może uniemoliwić użycie rabatów.</span>
                        </label>

                        <div className="authorization__error">
                            {registrationFormState.email.touched && (
                                registrationFormState.email.error
                            )}
                        </div>
                    </div>

                    <div className={`authorization__fieldset ${registrationFormState.password.touched && registrationFormState.password.error ? "--error" : ""}`}>
                        <label>
                            <input
                                type="password"
                                placeholder="Wpisz hasło"
                                onChange={setRegistrationPassword}
                                disabled={!isIdle}
                                onBlur={setRegistrationPasswordTouched}
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={50}
                                required
                            />
                            <span className="authorization__hint">8-50 znaków: min. 1 wielka i mała litera, cyfra i symbol.</span>
                        </label>
                        <div className="authorization__error">
                            {registrationFormState.password.touched && (
                                registrationFormState.password.error
                            )}
                        </div>
                    </div>

                    <div className={`authorization__fieldset ${registrationFormState.confirmPassword.touched && registrationFormState.confirmPassword.error ? "--error" : ""}`}>
                        <label>
                            <input
                                type="password"
                                name="confirm-password"
                                autoComplete="new-password"
                                placeholder="Potwierdź hasło"
                                onChange={setRegistrationConfirmPassword}
                                disabled={!isIdle}
                                onBlur={setRegistrationConfirmPasswordTouched}
                                minLength={8}
                                maxLength={50}
                                required
                            />
                        </label>
                        <div className="authorization__error">
                            {registrationFormState.confirmPassword.touched && (
                                registrationFormState.confirmPassword.error
                            )}
                        </div>
                    </div>

                    <div className={`authorization__fieldset ${registrationFormState.agreements.touched && registrationFormState.agreements.error ? "--error" : ""}`}>
                        <label className="authorization__agreements">
                            <input
                                type="checkbox"
                                name="agreements"
                                onChange={setAgreements}
                                disabled={!isIdle}
                                required
                            />
                            <span>
                                Akceptuję regulamin i politykę prywatności
                            </span>
                        </label>
                        <div className="authorization__error">
                            {registrationFormState.agreements.touched && (
                                registrationFormState.agreements.error
                            )}
                        </div>
                    </div>

                    <div className={`authorization__fieldset ${missingCaptchaAlert ? "--error" : ""}`}>
                        <div id="g-recaptcha" ref={captchaRenderingWrapperRef} />
                        <div className="authorization__error">
                            {missingCaptchaAlert && 'Proszę zaznaczyć weryfikację reCaptcha'}
                        </div>
                    </div>
                    <button
                        disabled={!isIdle || !!registrationFormState.email.error || !!registrationFormState.password.error || !!registrationFormState.confirmPassword.error || !!registrationFormState.agreements.error}
                        type="submit"
                    >
                        Rejestruję się
                    </button>
                </form>
            </section>

            <section className={activeSection === 'login' ? '--active' : ''}>
                <div className="horizontal-line">
                    <span className="horizontal-line__question">
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
                    <span className="horizontal-line__answer">
                        Lub zaloguj się:
                    </span>
                </div>
                <form
                    className="authorization__login-form"
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        logIn();
                    }}
                >
                    <div className={`authorization__fieldset ${emailTouched && emailError ? "--error" : ""}`}>
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

                        <div className="authorization__error">
                            {emailTouched && emailError && (
                                emailError
                            )}
                        </div>
                    </div>

                    <div className={`authorization__fieldset ${passwordTouched && passwordError ? "--error" : ""}`}>
                        <label>

                            <input
                                type="password"
                                autoComplete="current-password"
                                placeholder="Hasło"
                                onChange={(e) => {
                                    onSetPassword(e.target);
                                }}
                                disabled={!isIdle}
                                onBlur={() => setPasswordTouched(true)}
                            />
                        </label>
                        <div className="authorization__error">
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
    )
}

export default Authorization;