import { FC, useCallback, useEffect, useState } from "react"
import './AuthRequestResendVerification.css'
import PathsModule from "../../tools/paths";
import apiService from "../../services/ApiService";
import ClientLogsService from "../../services/LogsService";

const AuthRequestResendVerification: FC = () => {
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
            const {
                success,
            } = await apiService.fetch('auth/resend-verification-email', {
                method: 'POST',
                body: JSON.stringify({ email })
            }, [200]);

            if (success) {
                setIsSuccess(true);
            }

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
                        wysłano link weryfikacyjny.
                        <br /><br />
                        ⏱️
                        <br /><br />
                        Link będzie ważny przez<br />
                        <strong>10 minut</strong>.
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
                    założono konto, które chcesz zweryfikować:
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
                <a
                    href={PathsModule.Paths.Root}
                    className="secondary"
                    style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: "48px"
                    }}
                >
                    Powrót do strony głównej
                </a>
            </section>
        </div>
    )
}

export default AuthRequestResendVerification;