import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import UserRole, { UserModel } from '../services/DbService/instances/UsersDb.types';
import tools from './tools';
import Logs from '../services/LogService';
import { ManagerModel } from '../services/DbService/instances/ManagersDb.types';
import { AdminModel } from '../services/DbService/instances/AdminsDb.types';

const JWT_SECRET = process.env.JWT_SECRET!;

async function authenticateChangePasswordToken(req: Request, res: Response, next: NextFunction) {
    return await Logs.appLogs.catchUnhandled('[Middleware] authenticateChangePasswordToken()', async () => {
        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) {
            res.status(401).json({
                message: 'Brak tokenu.'
            });
            return;
        }

        jwt.verify(token, JWT_SECRET, async (err, user) => {
            return await Logs.appLogs.catchUnhandled('Middleware error on authenticateChangePasswordToken', async () => {

                if (err) {
                    try {
                        const expiredTokenData = jwt.decode(token);
                        await tools.updarteUserOrAssistangById((expiredTokenData as any)._id, { changePassword: undefined });
                    } catch (e) {
                        Logs.appLogs.report('Error on removing expired changePassword field', (setData) => {
                            setData('What happend', (e as any).message ?? e);
                        });
                    }
                    res.status(401).json({
                        message: 'Token jest już nieważny. Spróbuj ponownie.'
                    });
                    return;
                }

                const tokenizedUser = user as (UserModel | ManagerModel | AdminModel) & {
                    reason?: string;
                    stamp?: string;
                    _id?: string;
                };

                if (tokenizedUser?.reason !== 'CHANGE_PASSWORD') {
                    res.status(401).json({
                        message: 'Niewłaściwy token. Użyj tokenu wysłanego na emailem.'
                    });
                    return;
                }

                const currentUserOrAssistant = await tools.getUserOrAssistantById(tokenizedUser._id);

                if (!currentUserOrAssistant) {
                    res.status(401).json({
                        message: 'Tej operacji nie można wykonać.'
                    });
                    return;
                }

                if (tokenizedUser.stamp !== currentUserOrAssistant.changePassword?.emailSent) {
                    res.status(401).json({
                        message: 'Ten token jest już nieważny. Spróbuj ponownie.'
                    });
                    return;
                }

                if (currentUserOrAssistant.role === UserRole.User) {
                    const currentUser = currentUserOrAssistant as UserModel;
                    (req as any).user = currentUser;
                    next();
                } else if (currentUserOrAssistant.role === UserRole.Manager) {
                    const currentUser = currentUserOrAssistant as ManagerModel;
                    (req as any).user = currentUser;
                    next();
                } else if (currentUserOrAssistant.role === UserRole.Admin) {
                    const currentUser = currentUserOrAssistant as AdminModel;
                    (req as any).user = currentUser;
                    next();
                }
            });
        });
    }, (e) => {
        res.status(500).json({
            message: 'Nie udało się zmienić hasła za pomocą tokenu wysłanego na adres email.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
}

async function authenticateEmailVerificationToken(req: Request, res: Response, next: NextFunction) {
    return await Logs.appLogs.catchUnhandled('[Middleware] authenticateEmailVerificationToken()', async () => {

        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) {
            res.status(401).json({
                message: 'Brak tokenu.'
            });
            return;
        }

        jwt.verify(token, JWT_SECRET, async (err, user) => {
            return await Logs.appLogs.catchUnhandled('Middleware error on authenticateToken', async () => {

                if (err) {
                    res.status(401).json({
                        message: 'Token jest już nieważny. Wyślij email ponownie.'
                    });
                    return;
                }

                const tokenizedUser = user as (UserModel | ManagerModel | AdminModel) & {
                    stamp?: string;
                };

                if (!tokenizedUser.stamp) {
                    res.status(401).json({
                        message: 'Niewłaściwy token. Użyj tokenu wysłanego na emailem.'
                    });
                    return;
                }
                delete tokenizedUser.stamp;
                const currentUserOrAssistant = await tools.getUserOrAssistantById(tokenizedUser._id);

                if (!currentUserOrAssistant) {
                    res.status(401).json({
                        message: 'Brak użytkownika w bazie.'
                    });
                    return;
                }

                if (currentUserOrAssistant.role === UserRole.User) {
                    const currentUser = currentUserOrAssistant as UserModel;
                    (req as any).user = currentUser;
                    next();
                } else if (currentUserOrAssistant.role === UserRole.Manager) {
                    const currentUser = currentUserOrAssistant as ManagerModel;
                    (req as any).user = currentUser;
                    next();
                } else if (currentUserOrAssistant.role === UserRole.Admin) {
                    const currentUser = currentUserOrAssistant as AdminModel;
                    (req as any).user = currentUser;
                    next();
                }
            });
        });
    }, (e) => {
        res.status(500).json({
            message: 'Nie udało się zweryfikować adresu email za pomocą tokenu.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
}

async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    return await Logs.appLogs.catchUnhandled('Middleware error on authenticateToken', async () => {

        const token = req.header('Authorization')?.split(' ')[1];

        if (!token) {
            res.status(401).json({
                message: 'Brak tokenu.'
            });
            return;
        }

        jwt.verify(token, JWT_SECRET, async (err, user) => {
            return await Logs.appLogs.catchUnhandled('Middleware error on authenticateToken', async () => {

                if (err) {
                    res.status(401).json({
                        message: 'Sesja wygasła.',
                        code: 'TOKEN_EXPIRED'
                    });
                    return;
                }

                const tokenizedUser = user as UserModel | ManagerModel | AdminModel;
                const currentUserOrAssistant = await tools.getUserOrAssistantById(tokenizedUser._id);

                if (!currentUserOrAssistant) {
                    res.status(401).json({
                        message: 'Brak użytkownika w bazie.'
                    });
                    return;
                }

                if (currentUserOrAssistant.role === UserRole.User) {
                    const currentUser = currentUserOrAssistant as UserModel;
                    if (!currentUser.card) {
                        res.status(401).json({
                            message: 'Brak karty w bazie.'
                        });
                        return;
                    }

                    const { createdAt } = currentUser.card;
                    const cardIssuedDateStillValid = tools.validateCardIssuedDate(createdAt)
                    if (!cardIssuedDateStillValid) {
                        res.status(401).json({
                            message: 'Karta utraciła ważność.'
                        });
                        return;
                    }

                    (req as any).user = currentUser;
                    next();
                } else if (currentUserOrAssistant.role === UserRole.Manager) {
                    const currentUser = currentUserOrAssistant as ManagerModel;
                    (req as any).user = currentUser;
                    next();
                } else if (currentUserOrAssistant.role === UserRole.Admin) {
                    const currentUser = currentUserOrAssistant as AdminModel;
                    (req as any).user = currentUser;
                    next();
                }
            });
        });
    }, (e) => {
        res.status(500).json({
            message: 'Nie udało się sprawdzić tokenu.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
}


function requireAssistant(req: Request, res: Response, next: NextFunction) {
    Logs.appLogs.catchUnhandled('Middleware error on requireAdmin', () => {
        if (((req as any).user.role === UserRole.User)) {
            res.status(403).json({
                message: 'Wymagane są uprawnienia pracownika.'
            });
            return;
        }

        next()
    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło źle.',
            details: {
                url: req.url,
                error: JSON.stringify((e as any).message ?? e)
            }
        });
        return;
    });
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
    Logs.appLogs.catchUnhandled('Middleware error on requireAdmin', () => {
        if (((req as any).user.role !== UserRole.Admin)) {
            res.status(403).json({
                message: 'Wymagane są uprawnienia administratora.'
            });
            return;
        }

        next()
    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło źle.',
            details: {
                url: req.url,
                error: JSON.stringify((e as any).message ?? e)
            }
        });
        return;
    });
}
export default {
    authenticateToken,
    requireAssistant,
    requireAdmin,
    authenticateEmailVerificationToken,
    authenticateChangePasswordToken
}