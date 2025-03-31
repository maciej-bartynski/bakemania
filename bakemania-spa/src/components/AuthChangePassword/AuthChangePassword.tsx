import { FC, useCallback, useEffect, useReducer, useState } from "react"
import './AuthChangePassword.css'
import authHelpers from "./AuthChangePassword.helpers";
import PathsModule from "../../tools/paths";
import ClientLogsService from "../../services/LogsService";
import apiService from "../../services/ApiService";
import getQueryParams from "../../tools/getQueryParams";
import Config from "../../config";

const AuthChangePassword: FC = () => {

    const { token } = getQueryParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        PathsModule.globalCheckIsTokenAndRedirectRoot();
    }, []);

    const [registrationFormState, registrationFormDispatch] = useReducer(
        authHelpers.registrationReducer,
        authHelpers.registrationState
    );

    function setRegistrationPassword(e: React.ChangeEvent<HTMLInputElement>): void {
        registrationFormDispatch({ type: 'password', value: e.target.value });
    }

    function setRegistrationPasswordTouched(): void {
        registrationFormDispatch({ type: 'touch-password', value: '' });
    }

    function setRegistrationConfirmPasswordTouched(): void {
        registrationFormDispatch({ type: 'touch-confirm', value: '' });
    }

    function setRegistrationConfirmPassword(e: React.ChangeEvent<HTMLInputElement>): void {
        registrationFormDispatch({ type: 'confirm', value: e.target.value });
    }


    const register = useCallback(async () => {


        if (token) {

            window.localStorage.setItem(Config.sessionKeys.Token, token);
            setIsLoading(true);

            try {
                if (registrationFormState.password.value !== registrationFormState.confirmPassword.value) {
                    setIsLoading(false);
                    alert('Hasła nie pasują do siebie!');
                    return;
                }

                const is401 = await apiService.fetch('auth/change-password', {
                    method: 'POST',
                    body: JSON.stringify({
                        password: registrationFormState.password.value,
                    })
                }, [204], true);

                window.localStorage.removeItem(Config.sessionKeys.Token);

                if (is401 !== 401) {
                    setIsSuccess(true);
                }

            } catch (er) {
                const dataToPass = JSON.parse(JSON.stringify(registrationFormState));
                delete dataToPass.password.value;
                delete dataToPass.confirmPassword.value;
                new ClientLogsService().report('Error on AuthChangePassword', {
                    'What happened': er,
                    RegistrationFormState: registrationFormState,
                });
            } finally {
                window.localStorage.removeItem(Config.sessionKeys.Token);
                registrationFormDispatch({ type: 'reset', value: undefined });
                setIsLoading(false);
            }
        }
    }, [registrationFormState, token]);

    if (isSuccess) {
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
                                    🔑 Twoje hasło zostało zmienione.<br />
                                    🔐 Możesz zalgować się ponownie.
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
                                Przejdź do logowania 🔐 ➡️ 🔓
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        )
    }

    return (
        <div className="auth-registering">
            <section>
                <div className="horizontal-line">
                    <span className="horizontal-line__answer">
                        Wpisz nowe hasło:
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
                    <div className={`auth-registering__fieldset ${registrationFormState.password.touched && registrationFormState.password.error ? "--error" : ""}`}>
                        <label>
                            <input
                                type="password"
                                placeholder="Wpisz hasło"
                                onChange={setRegistrationPassword}
                                disabled={isLoading}
                                onBlur={setRegistrationPasswordTouched}
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={50}
                                required
                                value={registrationFormState.password.value}
                            />
                            <span className="auth-registering__hint">8-50 znaków: min. 1 wielka i mała litera, cyfra i symbol.</span>
                        </label>
                        <div className="auth-registering__error">
                            {registrationFormState.password.touched && (
                                registrationFormState.password.error
                            )}
                        </div>
                    </div>

                    <div className={`auth-registering__fieldset ${registrationFormState.confirmPassword.touched && registrationFormState.confirmPassword.error ? "--error" : ""}`}>
                        <label>
                            <input
                                type="password"
                                name="confirm-password"
                                autoComplete="new-password"
                                placeholder="Potwierdź hasło"
                                onChange={setRegistrationConfirmPassword}
                                disabled={isLoading}
                                onBlur={setRegistrationConfirmPasswordTouched}
                                minLength={8}
                                maxLength={50}
                                required
                                value={registrationFormState.confirmPassword.value}
                            />
                        </label>
                        <div className="auth-registering__error">
                            {registrationFormState.confirmPassword.touched && (
                                registrationFormState.confirmPassword.error
                            )}
                        </div>
                    </div>

                    <button
                        disabled={isLoading || !!registrationFormState.password.error || !!registrationFormState.confirmPassword.error}
                        type="submit"
                    >
                        Zmieniam hasło
                    </button>
                </form>
            </section>

            {
                isLoading && (
                    <div className="global-loader-wrapper">
                        <div className={`global-loader-spinner --active`} />
                    </div>
                )
            }
        </div >
    )
}

export default AuthChangePassword;