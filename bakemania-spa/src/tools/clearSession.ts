import Config from "../config";

function clearSession() {
    window.localStorage.removeItem(Config.sessionKeys.Token);
    window.localStorage.removeItem(Config.sessionKeys.Me);
    window.localStorage.removeItem(Config.sessionKeys.CardId);
}

export default clearSession;