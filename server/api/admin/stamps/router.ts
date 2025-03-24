import express from 'express';
import Tools from '../../../lib/tools';
import { broadcastToUser } from '../../../wsConnections';
import usersDb from '../../../services/DbService/instances/UsersDb';
import { UserModel } from '../../../services/DbService/instances/UsersDb.types';
import Logs from '../../../services/LogService';

const stampsRouter = express.Router();

stampsRouter.post('/change', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /change error', async () => {
        const {
            userId,
            amount,
            assistantId,
            cardHash
        } = req.body as {
            userId: string,
            amount: number,
            assistantId: string,
            cardHash: string,
        };

        if (typeof amount !== 'number' || Math.floor(amount) !== amount) {
            res.status(400).json({
                message: 'Ilość pieczątek musi być liczbą całkowitą.'
            });
            return;
        }

        if (typeof userId !== 'string') {
            res.status(400).json({ message: 'Id użytkownika jest wymagany.' });
            return;
        }

        if (typeof cardHash !== 'string') {
            res.status(400).json({ message: 'Id karty klienta jest wymagany.' });
            return;
        }

        if (typeof assistantId !== 'string') {
            res.status(400).json({ message: 'Id sprzedawcy jest wymagany. Zaloguj się i spróbuj ponownie.' });
            return;
        }

        const user = await usersDb.getById<UserModel>(userId);

        if (!user) {
            res.status(404).json({ message: 'Użytkownik nie istnieje.' });
            return;
        }

        if (!user.card) {
            res.status(404).json({ message: 'Karta klienta nie istnieje.' });
            return;
        }

        if (!Tools.validateCard(user.card, cardHash)) {
            if (!Tools.validateCardIssuedDate(user.card.createdAt)) {
                res.status(400).json({
                    message: 'Minęła data ważności karty klienta. Klient musi zalogować się i spróbować ponownie.'
                });
                return;
            } else {
                res.status(400).json({
                    message: 'Karta klienta jest nieważna. Klient musi zalogować się i spróbować ponownie.'
                });
                return;
            }
        }

        const updatedUserId = await usersDb.changeStampsAndWriteHistory(userId, amount, assistantId);

        if (updatedUserId) {
            const updatedUser = await usersDb.getSanitizedUserById(updatedUserId);
            broadcastToUser(updatedUserId, 'stamps');
            res.status(200).json(updatedUser);
            return;
        }

        res.status(500).json({
            message: 'Coś poszło nie tak podczas zmiany ilości pieczątek.'
        });
        return;

    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło nie tak podczas zmiany ilości pieczątek.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    })
});

stampsRouter.post('/change-force', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /change error', async () => {
        const {
            userId,
            amount,
            assistantId,
        } = req.body as {
            userId: string,
            amount: number,
            assistantId: string,
        };

        if (typeof amount !== 'number' || Math.floor(amount) !== amount) {
            res.status(400).json({
                message: 'Ilość pieczątek musi być liczbą całkowitą.'
            });
            return;
        }

        if (typeof userId !== 'string') {
            res.status(400).json({ message: 'Id użytkownika jest wymagany.' });
            return;
        }

        if (typeof assistantId !== 'string') {
            res.status(400).json({ message: 'Id sprzedawcy jest wymagany. Zaloguj się i spróbuj ponownie.' });
            return;
        }

        const user = await usersDb.getById<UserModel>(userId);

        if (!user) {
            res.status(404).json({ message: 'Użytkownik nie istnieje.' });
            return;
        }

        if (!user.card) {
            res.status(404).json({ message: 'Karta klienta nie istnieje.' });
            return;
        }

        const updatedUserId = await usersDb.changeStampsAndWriteHistory(userId, amount, assistantId);

        if (updatedUserId) {
            const updatedUser = await usersDb.getSanitizedUserById(updatedUserId);
            broadcastToUser(updatedUserId, 'stamps');
            res.status(200).json(updatedUser);
            return;
        }

        res.status(500).json({
            message: 'Coś poszło nie tak podczas zmiany ilości pieczątek.'
        });
        return;

    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło nie tak podczas zmiany ilości pieczątek.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    })
});

export default stampsRouter;