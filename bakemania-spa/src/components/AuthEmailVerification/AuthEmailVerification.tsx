import { FC, useEffect, useState } from "react";
import getQueryParams from "../../tools/getQueryParams";
import apiService from "../../services/ApiService";
import Config from "../../config";
import PathsModule from "../../tools/paths";
import "./AuthEmailVerification.css";

const AuthEmailVerification: FC = () => {
    const { token } = getQueryParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        PathsModule.globalCheckIsTokenAndRedirectRoot();
    }, []);

    if (isError) {
        return (
            <div className="verify-email">
                <span>
                    <strong>Uups... coś poszło źle.</strong><br /><br />
                    Twoje konto nie zostało zweryfikowane.<br />
                </span>

                <a href={PathsModule.Paths.Login} className="secondary">
                    Powrót do strony głównej
                </a>

                <a href={PathsModule.Paths.ResendVerificationEmail}>
                    Poproś o nowy email weryfikacyjny
                </a>
            </div >
        )
    }

    if (isVerified) {
        return (
            <div className="verify-email">
                <span>
                    <strong>Udało się!</strong> 💪<br /><br />
                    Twoje konto zostało zweryfikowane.<br />
                </span>
                <a href={PathsModule.Paths.Login}>
                    Zaloguj się 🔓
                </a>
            </div >
        )
    }
    return (
        <div className="verify-email">
            {token ? (
                <span>
                    Kliknij w przycisk poniżej,<br />aby zweryfikować swój email
                </span>
            ) :
                <span>
                    Ta ścieżka nie jest dla Ciebie dostępna :C<br />
                </span>
            }
            <div className="verify-email-container">
                {token ?
                    (<button
                        disabled={isLoading}
                        className="verify-email-button"
                        onClick={async () => {
                            if (token) {
                                setIsLoading(true);
                                window.localStorage.setItem(Config.sessionKeys.Token, token);
                                apiService.fetch('auth/verify-email', {
                                    method: 'GET',
                                }, [200], true).then((is401?: 401) => {
                                    window.localStorage.removeItem(Config.sessionKeys.Token);
                                    setIsLoading(false);
                                    if (is401 === 401) {
                                        setIsVerified(false);
                                        setIsError(true);
                                    } else {
                                        setIsError(false);
                                        setIsVerified(true);
                                    }
                                }).catch(() => {
                                    window.localStorage.removeItem(Config.sessionKeys.Token);
                                    setIsError(true);
                                    setIsVerified(false);
                                }).finally(() => {
                                    window.localStorage.removeItem(Config.sessionKeys.Token);
                                    setIsLoading(false);
                                });
                            }
                        }}
                    >
                        Zweryfikuj email
                    </button>
                    ) : (
                        <a href={PathsModule.Paths.Root}>
                            Wróć do aplikacji
                        </a>
                    )}
            </div>
        </div>
    );
}

export default AuthEmailVerification;