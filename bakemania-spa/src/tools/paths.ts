import Config from "../config";

enum Paths {
    Root = '/',
    Login = '/login',
    Register = '/register',
    EmailVerification = '/email-verification',
    ForgotPassword = '/forgot-password',
    ResetPassword = '/reset-password',
    SessionExpired = '/session-expired',
}

function redirect(to: Paths) {
    window.location.pathname = to;
}

function globalCheckIsTokenAndRedirectRoot() {
    if (window.localStorage.getItem(Config.sessionKeys.Token)) {
        redirect(Paths.Root);
    }
}

function inPageCheckNoTokenAndRedirectLogin() {
    if (!window.localStorage.getItem(Config.sessionKeys.Token)) {
        redirect(Paths.Login);
    }
}

const PathsModule = {
    redirect,
    globalCheckIsTokenAndRedirectRoot,
    inPageCheckNoTokenAndRedirectLogin,
    Paths,
}

export default PathsModule;

export type { Paths };