import express, { NextFunction, Request, Response } from 'express';
import Middleware from '../../lib/middleware';
import Tools from '../../lib/tools';
import Models from '../../lib/models';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logoutSteps from './logoutSteps';
import userValidator from './user.validator';
import * as uuid from 'uuid';
import UserRole, { UserModel } from './user.types';

const router = express.Router();

router.post('/register', async (req, res): Promise<void> => {
    console.error("TO TU JA JESTEM");

    const notSanitizedUser = {
        _id: uuid.v4(),
        role: UserRole.User,
        stamps: {
            amount: 0
        },
        ...req.body,
    } as UserModel;

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
        role: notSanitizedUser.role,
        stamps: {
            amount: notSanitizedUser.stamps.amount,
            // previousAmount: 0,
            // changedBy: notSanitizedUser._id,
            // changedAt: Date.now(),
        },
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

        const userFound = await Tools.usersFindOne({ email: sanitizedUser.email, _id: undefined });

        if (userFound) {
            res.status(400).json({
                message: 'Ten adres email jest już zajęty.',
                data: userFound.email
            });
            return;
        } else {
            const fileExists = fs.existsSync(`db/users/${sanitizedUser._id}.json`);
            if (fileExists) {
                res.status(400).json({
                    message: 'Błąd: identyfikator w użyciu.',
                    data: sanitizedUser._id
                });
                return;
            } else {
                fs.writeFileSync(`./db/users/${sanitizedUser._id}.json`, JSON.stringify(sanitizedUser, null, 2));
                res.status(201).json({
                    id: sanitizedUser._id
                });
                return;
            }
        }
    } catch (err) {
        res
            .status(400)
            .json({
                message: 'Rejestracja nie powiodła się z nieznanej przyczyny.',
                details: err
            });
        return;
    }
});

router.post('/login', async (req, res): Promise<void> => {

    try {
        const { email, password, subscription } = req.body;
        const user = await Tools.usersFindOne({ email, _id: undefined });
        const userExists = !!user;
        const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

        if (!userExists || !passwordMatch) {
            res
                .status(401)
                .json({
                    message: 'Użytkownik nie istnieje, lub hasło jest niepoprawne.',
                    details: {
                        userExists,
                        passwordMatch
                    }
                });
            return;

        } else {

            const JWT_SECRET = process.env.JWT_SECRET!
            const token = jwt.sign({
                role: user.role,
                email: user.email,
                _id: user._id
            }, JWT_SECRET, { expiresIn: '365d' });

            try {
                if (subscription) {
                    const { endpoint, keys } = subscription;
                    const newSubscription = new Models.PushSubscriptionModel({
                        userId: user._id,
                        endpoint,
                        keys,
                        token
                    }).toJSON();

                    fs.writeFileSync(`./db/sessions/${newSubscription.userId}.json`, JSON.stringify(newSubscription, null, 2));
                }
            } catch (e) {
                console.warn("Błąd suba", e);
            }
            res.status(200).json({ token });
            return;
        }
    } catch (e) {
        res
            .status(500)
            .json({
                message: 'Logowanie nie powiodło się z nieznanej przyczyny.',
                details: e
            });
        return;

    }
});

router.get('/logout', Middleware.authenticateToken, (req: Request, res: Response, next: NextFunction): void => {
    try {
        const userId: string = (req as any).user._id;
        return logoutSteps(userId, res);
    } catch (e) {
        res.status(500).json({
            message: "Kasacja sesji nie powiodła się.",
            details: e
        })
    }
});

export default router;
