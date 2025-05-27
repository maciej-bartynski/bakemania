import express from 'express';
import Tools from '../../lib/tools';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userValidatorsModule from './user.validator';
import * as uuid from 'uuid';
import UserRole, { StampsHistoryEntry, UserModel } from '../../services/DbService/instances/UsersDb.types';
import usersDb from '../../services/DbService/instances/UsersDb';
import Logs from '../../services/LogService';
import { ManagerModel } from '../../services/DbService/instances/ManagersDb.types';
import { AdminModel } from '../../services/DbService/instances/AdminsDb.types';
import rateLimit from 'express-rate-limit';
import EmailService from '../../services/EmailService/EmailService';
import middleware from '../../lib/middleware';
import tools from '../../lib/tools';

const { userValidator, passwordValidator } = userValidatorsModule;


const router = express.Router();

const limiterForApiCalls = rateLimit({
    message: {
        message: "Ej, chcesz pączka? TO SIĘ SKUP! Spróbuj ponownie za 1 minutę.",
    },
    windowMs: 60000, // 1 min
    limit: 5, // Limit each IP to e requests per `window` (here, per 1 min).
    standardHeaders: 'draft-8',
    legacyHeaders: false,
})

const limiterForAccountsCreated = rateLimit({
    message: {
        message: "Hola, nie za dużo tych kont, łasuchu? Spróbuj ponownie za 24 godziny.",
    },
    windowMs: 60000 * 60 * 24, // 1 dzien
    limit: 2, // Limit each IP to e requests per `window` (here, per 1 day).
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

const limiterForPasswordChangeRequests = rateLimit({
    message: {
        message: "Hola, skup się! Spróbuj ponownie za 1 godzinę.",
    },
    windowMs: 60000 * 60 * 1, // 1 godzina
    limit: 3, // Limit each IP to e requests per `window` (here, per 1 day).
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

router.post('/resend-verification-email', async (req, res) => {
    return Logs.appLogs.catchUnhandled('Handler "/verify-email-token" error', async () => {
        const { email } = (req as any).body;
        const user = await tools.getUserOrAssistantByEmail(email);
        if (!user) {
            res.status(400).json({
                message: 'Nie znaleziono użytkownika o podanym adresie email'
            });
            return;
        }

        if (user.verification.isVerified) {
            res.status(400).json({
                message: 'Użytkownik jest już zweryfikowany'
            });
            return;
        }

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw 'Missing secret.';
        }

        const emailVerificationToken = jwt.sign({
            _id: user._id,
            stamp: uuid.v4(),
        }, JWT_SECRET, { expiresIn: process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME });

        const sanitizedUser = {
            ...user,
            verification: {
                isVerified: false,
                token: emailVerificationToken,
            }
        }

        await EmailService.sendVerificationEmail(sanitizedUser as any);
        res.status(200).json({
            success: true
        });
    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło nie tak podczas wysyłania emaila z linkiem do weryfikacji',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
});

router.post('/change-password', middleware.authenticateChangePasswordToken, async (req, res) => {
    return Logs.appLogs.catchUnhandled('Handler "/change-password" error', async () => {
        const { password } = (req as any).body;
        const user = (req as any).user;

        if (!password) {
            try {
                await tools.updateUserOrAssistantById((user as any)._id, { changePassword: undefined });
            } catch (e) {
                Logs.appLogs.report('Error on removing changePassword field', (setData) => {
                    setData('What happend', (e as any).message ?? e);
                });
            }
            res.status(400).json({
                message: 'Nie podano nowego hasła'
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const errorMessage = passwordValidator(password);

        if (typeof errorMessage === 'string') {
            try {
                await tools.updateUserOrAssistantById((user as any)._id, { changePassword: undefined });
            } catch (e) {
                Logs.appLogs.report('Error on removing changePassword field', (setData) => {
                    setData('What happend', (e as any).message ?? e);
                });
            }
            res.status(400).json({ message: errorMessage });
            return;
        }

        await tools.updateUserOrAssistantById(user._id, {
            password: hashedPassword,
            changePassword: undefined
        });
        res.status(204).send();
    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło nie tak podczas zmiany hasła.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
});

router.post('/change-password-request', limiterForPasswordChangeRequests, async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler "/change-password-request" error', async () => {
        const { email } = (req as any).body;
        if (!email) {
            res.status(400).json({
                message: 'Nie podano adresu email'
            });
            return;
        }
        const user = await tools.getUserOrAssistantByEmail(email);
        if (!user) {
            res.status(403).json({
                message: 'Ta operacja nie jest dostępna'
            });
            return;
        }

        const emailSentAlready = user.changePassword?.emailSent;

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw 'Missing secret.';
        }

        const emailSentIdentifier = uuid.v4();
        const changePasswordToken = jwt.sign({
            _id: user._id,
            reason: 'CHANGE_PASSWORD',
            stamp: emailSentIdentifier
        }, JWT_SECRET, { expiresIn: process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME });

        await EmailService.sendChangePasswordEmail(user, changePasswordToken);
        const createdId = await tools.updateUserOrAssistantById(user._id, {
            changePassword: {
                emailSent: emailSentIdentifier
            }
        });
        if (createdId) {
            res.status(200).json({
                success: true,
                isNextEmail: emailSentAlready,
            });
            return;
        } else {
            res.status(500).json({
                success: true,
                message: 'Błąd podczas wysyłania emaila weryfikacyjnego [1].',
            });
            return;
        }
    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło nie tak podczas próby wysłania emaila z linkiem do zmiany hasła.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
});

router.get('/verify-email', middleware.authenticateEmailVerificationToken, async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler "/verify-email" error', async () => {
        const user = (req as any).user;
        const newVerificationData: UserModel['verification'] = {
            isVerified: true,
        };

        await tools.updateUserOrAssistantById(user._id, {
            verification: newVerificationData
        });

        res.status(200).json({ success: true });
    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło nie tak podczas weryfikacji emaila [3].',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
});

router.post('/register',
    limiterForApiCalls,
    async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {

        const {
            password,
            email,
            captchaToken,
            agreements,
        } = req.body as {
            password: string,
            email: string,
            captchaToken: string,
            agreements: boolean,
        };

        const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';

        const captchaData: {
            success: boolean,
            error?: any
        } = await fetch(verificationURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `secret=${process.env.CAPTCHA_SECRET_KEY}&response=${captchaToken}`
        }).then(data => {
            return data.json();
        }).catch(err => {
            Logs.appLogs.report('Captcha verification error', (setData) => {
                setData('What happened:', err);
            });
            return {
                success: false,
                error: err
            }
        });

        if (!captchaData.success) {
            res.status(400).json({
                message: 'Weryfikacja reCAPTCHA nie powiodła się'
            });
            return;
        }

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw 'Missing secret.';
        }

        const newUserId = uuid.v4();
        const emailVerificationToken = jwt.sign({
            _id: newUserId,
            stamp: uuid.v4(),
        }, JWT_SECRET, { expiresIn: process.env.EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME });

        const notSanitizedUser: UserModel = {
            _id: newUserId,
            role: UserRole.User,
            stamps: {
                amount: 0,
                history: [] as StampsHistoryEntry[],
            },
            password,
            email,
            agreements: agreements as true,
            verification: {
                isVerified: false,
                token: emailVerificationToken,
            }
        };

        const errorMessage = userValidator(notSanitizedUser);

        if (typeof errorMessage === 'string') {
            if (errorMessage.trim()) {
                res.status(400).json({ message: errorMessage });
                return;
            } else {
                res.status(400).json({ message: 'Coś poszło źle podczas walidacji użytkownika' });
                return;
            }
        }

        const hashedPassword = await bcrypt.hash(notSanitizedUser.password, 10);

        const sanitizedUser: UserModel = {
            _id: notSanitizedUser._id,
            email: notSanitizedUser.email,
            password: notSanitizedUser.password,
            card: notSanitizedUser.card,
            role: notSanitizedUser.role,
            stamps: {
                amount: notSanitizedUser.stamps.amount,
                history: notSanitizedUser.stamps.history,
            },
            agreements: notSanitizedUser.agreements,
            verification: notSanitizedUser.verification,
        };

        const userErrorMessage = userValidator(sanitizedUser);

        sanitizedUser.password = hashedPassword;

        (sanitizedUser as any).unique = notSanitizedUser.password;

        if (typeof userErrorMessage === 'string') {
            if (userErrorMessage.trim()) {
                res.status(400).json({ message: userErrorMessage });
                return;
            } else {
                res.status(400).json({ message: 'Coś poszło źle podczas wtórnej walidacji użytkownika' });
                return;
            }
        }

        try {

            const userFoundByMail = await Tools.getUserOrAssistantByEmail(sanitizedUser.email);

            if (userFoundByMail) {
                res.status(400).json({
                    message: 'Ten adres email jest już zajęty.',
                    data: userFoundByMail.email
                });
                return;
            } else {
                const userFoundById = await Tools.getUserOrAssistantById(sanitizedUser._id);
                if (userFoundById) {
                    res.status(400).json({
                        message: 'Ups... ID w użyciu. To matematycznie nieprawdopodobne. Puść totka, bo masz szczęście! A co do rejestracji - proszę, spróbuj ponownie.',
                        data: sanitizedUser._id
                    });
                    return;
                } else {
                    (req as any).creationData = sanitizedUser;
                    next();
                }
            }
        } catch (err) {

            Logs.appLogs.report('/register unexpected error', (setData) => {
                setData('Description:', 'Rejestracja nie powiodła się z nieznanej przyczyny.');
                setData('What happened:', err);
            });

            res
                .status(400)
                .json({
                    message: 'Rejestracja nie powiodła się z nieznanej przyczyny.',
                    details: err
                });
            return;
        }
    },
    limiterForAccountsCreated,
    async (req: express.Request, res: express.Response) => {
        Logs.appLogs.catchUnhandled('Handler "/register" error', async () => {
            const sanitizedUser = (req as any).creationData;
            await EmailService.sendVerificationEmail(sanitizedUser);
            const createdId = await usersDb.setById<UserModel>(sanitizedUser._id, sanitizedUser);
            if (createdId) {
                res.status(201).json({
                    id: sanitizedUser._id
                });
                return;
            } else {
                res.status(500).json({
                    message: 'Błąd podczas wysyłania emaila weryfikacyjnego [1].',
                });
                return;
            }
        }, (e) => {
            res.status(500).json({
                message: 'Coś poszło nie tak podczas wysyłania emaila weryfikacyjnego [2].',
                details: JSON.stringify((e as any)?.message ?? e)
            });
            return;
        });
    });

router.post('/login', async (req, res) => {
    return Logs.appLogs.catchUnhandled('Handler "/login" error', async () => {
        const { email, password } = req.body;

        const userOrAssistan: UserModel | ManagerModel | AdminModel | null = await Tools.getUserOrAssistantByEmail(email);

        const userExists = !!userOrAssistan;
        const passwordMatch = userOrAssistan ? await bcrypt.compare(password, userOrAssistan.password) : false;

        if (!userExists) {
            res.status(401).json({
                message: 'Niepoprawny adres email lub hasło',
                details: {
                    userExists,
                    passwordMatch
                }
            });
            return;
        } else if (!passwordMatch) {
            res.status(401).json({
                message: 'Niepoprawne hasło lub adres email',
                details: {
                    userExists,
                    passwordMatch
                }
            });
            return;
        } else {
            const JWT_SECRET = process.env.JWT_SECRET;

            if (!JWT_SECRET) {
                throw 'Missing secret.';
            }

            if (userOrAssistan && !userOrAssistan.verification.isVerified) {
                res.status(403).json({
                    message: 'Konto nie zostało jeszcze zweryfikowane',
                });
                return;
            }

            const token = jwt.sign({
                role: userOrAssistan.role,
                email: userOrAssistan.email,
                _id: userOrAssistan._id
            }, JWT_SECRET, { expiresIn: process.env.AUTH_TOKEN_EXPIRATION_TIME });

            if (userOrAssistan.role === UserRole.User) {
                const newUserCard = await Tools.createCardId();
                await usersDb.updateById<UserModel>(userOrAssistan._id, { card: newUserCard, changePassword: undefined });
                res.status(200).json({
                    token,
                    cardId: newUserCard.hash
                });
            } else {
                res.status(200).json({
                    token,
                    cardId: null
                });
            }
            return
        }
    }, (e) => {
        res.status(500).json({
            message: 'Logowanie nie powiodło się z nieznanej przyczyny.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    })
});

export default router;
