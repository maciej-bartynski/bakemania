import { FC, useCallback, useEffect, useReducer, useRef, useState } from "react"
import './AuthRegistering.css'
import authHelpers from "./AuthRegistering.helpers";
import PathsModule from "../../tools/paths";
import ClientLogsService from "../../services/LogsService";
import { RegisterRequestBody } from "../../shared-types/Register";
import apiService from "../../services/ApiService";

const AuthRegistering: FC = () => {

    useEffect(() => {
        PathsModule.globalCheckIsTokenAndRedirectRoot();
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState<'pristine' | 'success' | 'fail'>('pristine');

    const [registrationFormState, registrationFormDispatch] = useReducer(
        authHelpers.registrationReducer,
        authHelpers.registrationState
    );

    function setRegistrationEmail(e: React.ChangeEvent<HTMLInputElement>): void {
        registrationFormDispatch({ type: 'username', value: e.target.value });
    }

    function setRegistrationPassword(e: React.ChangeEvent<HTMLInputElement>): void {
        registrationFormDispatch({ type: 'new-password', value: e.target.value });
    }

    function setRegistrationEmailTouched(): void {
        registrationFormDispatch({ type: 'touch-username', value: '' });
    }

    function setRegistrationPasswordTouched(): void {
        registrationFormDispatch({ type: 'touch-new-password', value: '' });
    }

    function setRegistrationConfirmPasswordTouched(): void {
        registrationFormDispatch({ type: 'touch-confirm-new-password', value: '' });
    }

    function setAgreements(e: React.ChangeEvent<HTMLInputElement>): void {
        const checked = e.target.checked;
        registrationFormDispatch({ type: 'agreements', value: checked });
    }

    function setRegistrationConfirmPassword(e: React.ChangeEvent<HTMLInputElement>): void {
        registrationFormDispatch({ type: 'confirm-new-password', value: e.target.value });
    }

    const [missingCaptchaAlert, setMissingCaptchaAlert] = useState(false);

    const register = useCallback(async () => {

        setIsLoading(true);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const captchaToken = (window as any).grecaptcha?.getResponse();

            if (!captchaToken) {
                setMissingCaptchaAlert(true);
                setIsLoading(false);
                alert('Proszę zaznaczyć weryfikację reCaptcha');
                return;
            } else {
                setMissingCaptchaAlert(false);
            }

            if (registrationFormState['new-password'].value !== registrationFormState['confirm-new-password'].value) {
                setIsLoading(false);
                alert('Hasła nie pasują do siebie!');
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).grecaptcha?.reset();

            const registrationRequestBody: RegisterRequestBody = {
                email: registrationFormState.username.value,
                password: registrationFormState['new-password'].value,
                captchaToken,
                agreements: registrationFormState.agreements.value,
            }

            await apiService.fetch('auth/register', {
                method: 'POST',
                body: JSON.stringify(registrationRequestBody)
            }, [201]);

            setIsRegistered('success');

        } catch (er) {
            const dataToPass = JSON.parse(JSON.stringify(registrationFormState));
            delete dataToPass['new-password'].value;
            delete dataToPass['confirm-new-password'].value;
            new ClientLogsService().report('Error on AuthRegistering', {
                'What happened': er,
                RegistrationFormState: registrationFormState,
            });
            setIsRegistered('fail');
        } finally {
            registrationFormDispatch({ type: 'reset', value: undefined });
            setIsLoading(false);
        }

    }, [registrationFormState]);

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

    if (isRegistered === 'success') {
        return (
            <div className="auth-registering">
                <section>
                    <div>
                        <div className="horizontal-line">
                            <span className="horizontal-line__question">
                                <strong>Udało się!</strong> 💪<br /><br />

                                <span
                                    className="horizontal-line__question"
                                    style={{
                                        textAlign: 'left',
                                    }}
                                >
                                    📩 Wysłaliśmy Ci email weryfikacyjny.<br />
                                    📨 Zanim się zalogujesz, sprawdź pocztę!<br />
                                    🔓 Po kliknięciu w link weryfikacyjny, możesz się zalogować.
                                </span>
                            </span>
                            <br />
                            <button
                                disabled={isLoading}
                                type="button"
                                onClick={() => {
                                    PathsModule.redirect(PathsModule.Paths.Login);
                                }}
                                style={{
                                    height: 'unset',
                                    padding: '10px 20px',
                                }}
                            >
                                🔑 Sprawdziłem pocztę, loguję się!
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        )
    }

    if (isRegistered === 'fail') {
        return (
            <div className="auth-registering">
                <section>
                    <div>
                        <div className="horizontal-line">
                            <span className="horizontal-line__question">
                                <strong>Uups...</strong><br /><br />

                                <span
                                    className="horizontal-line__question"
                                    style={{
                                        textAlign: 'center',
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>❗</span><br /><br />
                                    Coś poszło nie tak. Niestety, twoje<br />
                                    konto <strong style={{ color: 'red' }}>nie zostało utworzone</strong>.
                                </span>
                            </span>
                            <br />
                            <button
                                disabled={isLoading}
                                type="button"
                                onClick={() => {
                                    window.location.reload();
                                }}
                                style={{
                                    height: 'unset',
                                    padding: '10px 20px',
                                }}
                            >
                                Próbuję jeszcze raz
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        )
    }

    if (!captchaLoaded) {
        return (
            <div className="auth-registering">
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                    paddingTop: 60,
                    paddingBottom: 60,
                }}>
                    <span>Ładowanie captcha...</span>
                </div>
                <div className="global-loader-wrapper">
                    <div className={`global-loader-spinner --active`} />
                </div>
            </div>
        )
    }

    return (
        <div className="auth-registering">
            <section>
                <div className="horizontal-line">
                    <span className="horizontal-line__question">
                        Masz już konto <strong>bakeMAnia</strong>?
                    </span>
                    <button
                        className='secondary'
                        disabled={isLoading}
                        type="button"
                        onClick={() => {
                            PathsModule.redirect(PathsModule.Paths.Login);
                        }}
                    >
                        Przejdź do logowania
                    </button>
                    <span className="horizontal-line__answer">
                        Nie mam konta, chcę dołączyć:
                    </span>

                </div>
                <form
                    className="auth-registering__register-form"
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        register();
                    }}
                >
                    <div className={`auth-registering__fieldset ${registrationFormState.username.touched && registrationFormState.username.error ? "--error" : ""}`}>
                        <label>
                            <input
                                type="email"
                                autoComplete="username"
                                name="username"
                                placeholder="Wpisz swój e-mail"
                                onChange={setRegistrationEmail}
                                disabled={isLoading}
                                onBlur={setRegistrationEmailTouched}
                                value={registrationFormState.username.value}
                            />
                            <span className="auth-registering__hint">Błędny adres może uniemoliwić użycie rabatów.</span>
                        </label>

                        <div className="auth-registering__error">
                            {registrationFormState.username.touched && (
                                registrationFormState.username.error
                            )}
                        </div>
                    </div>

                    <div className={`auth-registering__fieldset ${registrationFormState['new-password'].touched && registrationFormState['new-password'].error ? "--error" : ""}`}>
                        <label>
                            <input
                                type="password"
                                name="new-password"
                                autoComplete="new-password"
                                placeholder="Wpisz hasło"
                                onChange={setRegistrationPassword}
                                disabled={isLoading}
                                onBlur={setRegistrationPasswordTouched}
                                minLength={8}
                                maxLength={50}
                                required
                                value={registrationFormState['new-password'].value}
                            />
                            <span className="auth-registering__hint">8-50 znaków: min. 1 wielka i mała litera, cyfra i symbol.</span>
                        </label>
                        <div className="auth-registering__error">
                            {registrationFormState['new-password'].touched && (
                                registrationFormState['new-password'].error
                            )}
                        </div>
                    </div>

                    <div className={`auth-registering__fieldset ${registrationFormState['confirm-new-password'].touched && registrationFormState['confirm-new-password'].error ? "--error" : ""}`}>
                        <label>
                            <input
                                type="password"
                                name="confirm-new-password"
                                autoComplete="new-password"
                                placeholder="Potwierdź hasło"
                                onChange={setRegistrationConfirmPassword}
                                disabled={isLoading}
                                onBlur={setRegistrationConfirmPasswordTouched}
                                minLength={8}
                                maxLength={50}
                                required
                                value={registrationFormState['confirm-new-password'].value}
                            />
                        </label>
                        <div className="auth-registering__error">
                            {registrationFormState['confirm-new-password'].touched && (
                                registrationFormState['confirm-new-password'].error
                            )}
                        </div>
                    </div>

                    <div className={`auth-registering__fieldset ${registrationFormState.agreements.touched && registrationFormState.agreements.error ? "--error" : ""}`}>
                        <label className="auth-registering__agreements">
                            <input
                                type="checkbox"
                                name="agreements"
                                onChange={setAgreements}
                                disabled={isLoading}
                                required
                                checked={registrationFormState.agreements.value}
                            />
                            <span className="auth-registering__agreements-text">
                                Akceptuję <a href="/files/Regulamin.pdf" target="_blank" rel="noopener noreferrer">regulamin</a> i <a href="/files/Polityka-prywatnosci.pdf" target="_blank" rel="noopener noreferrer">politykę prywatności</a>
                            </span>
                        </label>
                        <div className="auth-registering__error">
                            {registrationFormState.agreements.touched && (
                                registrationFormState.agreements.error
                            )}
                        </div>
                    </div>

                    <div className={`auth-registering__fieldset ${missingCaptchaAlert ? "--error" : ""}`}>
                        <div id="g-recaptcha" ref={captchaRenderingWrapperRef} />
                        <div className="auth-registering__error">
                            {missingCaptchaAlert && 'Proszę zaznaczyć weryfikację reCaptcha'}
                        </div>
                    </div>
                    <button
                        disabled={isLoading || !!registrationFormState.username.error || !!registrationFormState['new-password'].error || !!registrationFormState['confirm-new-password'].error || !!registrationFormState.agreements.error}
                        type="submit"
                    >
                        Rejestruję się
                    </button>
                </form>
            </section>

            {isLoading && (
                <div className="global-loader-wrapper">
                    <div className={`global-loader-spinner --active`} />
                </div>
            )}
        </div>
    )
}

export default AuthRegistering;