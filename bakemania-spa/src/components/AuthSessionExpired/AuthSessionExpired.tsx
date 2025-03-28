import { FC, useEffect } from "react";
import PathsModule from "../../tools/paths";
import "./AuthSessionExpired.css";

const AuthSessionExpired: FC = () => {

    useEffect(() => {
        PathsModule.globalCheckIsTokenAndRedirectRoot();
    }, []);

    return (
        <div className="session-expired">
            <span>
                Twoja sesja wygasła!<br />Zaloguj się ponownie.
            </span>
            <div className="session-expired-container">
                <button
                    className="session-expired-button"
                    onClick={async () => {
                        PathsModule.redirect(PathsModule.Paths.Login);
                    }}
                >
                    Zaloguj się
                </button>
            </div>
        </div>
    );
}

export default AuthSessionExpired;