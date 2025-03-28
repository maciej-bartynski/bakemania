import { FC, useCallback, useEffect, useState } from "react"
import './AuthRequestPasswordChange.css'
import PathsModule from "../../tools/paths";
import apiService from "../../services/ApiService";
import ClientLogsService from "../../services/LogsService";

const AuthRequestPasswordChange: FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);

    const onSetEmail = useCallback((emailInput: HTMLInputElement) => {
        setEmail(emailInput.value.trim());
        const isValid = emailInput.checkValidity();
        setEmailError(isValid ? "" : 'Niepoprawny adres e-mail.');
    }, [setEmail]);

    const sendRequestChangePassword = useCallback(async () => {
        setIsLoading(true);
        try {
            await apiService.fetch('auth/change-password-request', {
                method: 'POST',
                body: JSON.stringify({ email })
            }, [204])
            setIsSuccess(true);

        } catch (error) {
            const clientLogs = new ClientLogsService();
            clientLogs.report('Rejection on ApiService, error on parsing rejection', {
                Url: 'auth/change-password-request',
                // eslint-disable-next-line
                'Catched error': `${(error as any)?.message ?? error}`
            });
        } finally {
            setIsLoading(false);
            setEmailTouched(false);
            setEmailError('');
            setEmail('');
        }

    }, [email]);

    useEffect(() => {
        PathsModule.globalCheckIsTokenAndRedirectRoot();
    });

    if (isSuccess) {
        return (
            <div className="authorization">
                <section>
                    <span style={{ textAlign: 'center', display: 'block' }}>
                        Na podany przez Ciebie adres e-mail
                        <br />
                        wysłano link do zmiany hasła.
                    </span>
                </section>
            </div>
        )
    }

    return (
        <div className="authorization">
            <section>

                <span style={{ textAlign: 'center', display: 'block' }}>
                    Podaj adres email, na który
                    <br />
                    założono konto:
                </span>

                <br />

                <form
                    className="authorization__login-form"
                    onSubmit={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        sendRequestChangePassword();
                    }}
                >
                    <div className={`authorization__fieldset ${emailTouched && emailError ? "--error" : ""}`}>
                        <label>
                            <input
                                type="email"
                                autoComplete="username"
                                placeholder="E-mail użyty do założenia konta"
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

                    <button
                        disabled={isLoading || !email || !!emailError}
                        type="submit"
                    >
                        Potwierdam, że to mój adres email
                    </button>
                </form>
            </section>
        </div>
    )
}

export default AuthRequestPasswordChange;