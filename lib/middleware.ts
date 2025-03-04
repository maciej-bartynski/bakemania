import jwt from 'jsonwebtoken';
import Keys from '../env';
import logoutSteps from '../api/auth/logoutSteps';
import Tools from './tools';
import { NextFunction, Request, Response } from 'express';

async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res
            .status(401)
            .json({ message: 'Brak tokenu.' });
        return;
    } else {

        jwt.verify(
            token,
            Keys.JWT_SECRET,

            async (err: any, user: any): Promise<void> => {

                if (err) {
                    const expiredUserId = (/** @type {any} */ (jwt.decode(token)) as any)?._id;
                    if (expiredUserId) {
                        logoutSteps(expiredUserId, res)
                    } else {
                        res
                            .status(404)
                            .json({ message: 'Niepoprawny token: użytkownik nie został odnaleziony.' });
                        return;
                    }

                } else {
                    (req as any).user = user as any;
                    const sessionId = ((req as any).user as any)._id;
                    const existingSubscription = await Tools.subscriptionsFindOne({ userId: sessionId });

                    if (!existingSubscription) {
                        res.status(404).json({ message: 'Ta sesja nie istnieje.' });
                        return;
                    } else {
                        next();
                    };
                }
            });
    }
}


function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (((req as any).user.role === 'user')) {
        res.status(403).json({ message: 'Wymagane są uprawnienia admina.' });
    } else next();
}

export default {
    authenticateToken,
    requireAdmin
}