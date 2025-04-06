import { FC, useCallback, useEffect, useState } from "react"
import './AuthLogin.css'
import PathsModule from "../../tools/paths";
import Config from "../../config";
import apiService from "../../services/ApiService";
import ClientLogsService from "../../services/LogsService";

const AuthLogin: FC = () => {
    const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
        try {
            const loginResponse = await apiService.fetch('auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            })

            const token: string | null = (typeof loginResponse?.token === 'string' && loginResponse?.token?.trim())
                ? loginResponse.token as string
                : null;

            const cardId: string | null = (typeof loginResponse?.cardId === 'string' && loginResponse?.cardId?.trim())
                ? loginResponse.token as string
                : null;

            if (!token) {
                throw new Error('Nie udało się pobrać tokenu autoryzacji.');
            }
            window.localStorage.setItem(Config.sessionKeys.Token, token);
            if (cardId) {
                window.localStorage.setItem(Config.sessionKeys.CardId, cardId);
            }
            PathsModule.redirect(PathsModule.Paths.Root);
        } catch (error) {
            const clientLogs = new ClientLogsService();
            clientLogs.report('Rejection on ApiService, error on parsing rejection', {
                Url: 'auth/login',
                // eslint-disable-next-line
                'Catched error': `${(error as any)?.message ?? error}`
            });
        } finally {
            setIsLoading(false);
            setEmailTouched(false);
            setPasswordTouched(false);
            setEmailError('');
            setPasswordError('');
            setEmail('');
            setPassword('');
        }

    }, [email, password]);

    useEffect(() => {
        PathsModule.globalCheckIsTokenAndRedirectRoot();
    });

    return (
        <div className="authorization">
            <section>
                <div className="horizontal-line">
                    <span className="horizontal-line__question">
                        Dołącz do klubu <strong>bakeMAnia</strong>
                    </span>
                    <button
                        className='secondary'
                        disabled={isLoading}
                        type="button"
                        onClick={() => {
                            PathsModule.redirect(PathsModule.Paths.Register);
                        }}
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
                                disabled={isLoading}
                                onBlur={() => setEmailTouched(true)}
                                value={email}
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
                                disabled={isLoading}
                                onBlur={() => setPasswordTouched(true)}
                                value={password}
                            />
                        </label>
                        <div className="authorization__error">
                            {passwordTouched && passwordError && (
                                passwordError
                            )}
                        </div>
                    </div>

                    <button
                        disabled={isLoading || !email || !password || !!emailError || !!passwordError}
                        type="submit"
                    >
                        Zaloguj się
                    </button>
                    <hr />
                    <a
                        href={PathsModule.Paths.ForgotPassword}
                        className='tertiary'
                    >
                        Zapomniałam(em) hasła
                    </a>
                </form>
            </section>
        </div>
    )
}

export default AuthLogin;