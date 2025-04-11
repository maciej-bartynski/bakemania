import express from 'express';
import Tools from '../../lib/tools';
import { broadcastToUser } from '../../wsConnections';
import usersDb from '../../services/DbService/instances/UsersDb';
import UserRole, { UserModel } from '../../services/DbService/instances/UsersDb.types';
import Logs from '../../services/LogService';
import managersDb from '../../services/DbService/instances/ManagersDb';
import { ManagerModel, SanitizedManagerModel } from '../../services/DbService/instances/ManagersDb.types';
import middleware from '../../lib/middleware';
import { Document } from '../../services/DbService/DbTypes';
import adminsDb from '../../services/DbService/instances/AdminsDb';
import { AdminModel } from '../../services/DbService/instances/AdminsDb.types';

const assistantRouter = express.Router();

assistantRouter.post('/stamps/change', async (req, res) => {
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

        const assistant = await Tools.getSanitizedAssistantById(assistantId);

        if (!assistant) {
            res.status(404).json({ message: 'Konto asystenta nie istnieje.' });
            return;
        }

        const historyEntry = await usersDb.changeStampsAndWriteHistory(userId, amount, assistantId);

        if (historyEntry) {
            await Tools.updateUserOrAssistantById(assistantId, {
                transactionsHistory: [...(assistant.transactionsHistory ?? []), historyEntry]
            });
            const updatedUser = await usersDb.getSanitizedUserById(userId);
            broadcastToUser(userId, 'stamps');
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

assistantRouter.post('/stamps/change-force', async (req, res) => {
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

        const assistant = await Tools.getSanitizedAssistantById(assistantId);

        if (!assistant) {
            res.status(404).json({ message: 'Konto asystenta nie istnieje.' });
            return;
        }

        const historyEntry = await usersDb.changeStampsAndWriteHistory(userId, amount, assistantId);

        if (historyEntry) {
            await Tools.updateUserOrAssistantById(assistantId, {
                transactionsHistory: [...(assistant.transactionsHistory ?? []), historyEntry]
            });
            const updatedUser = await usersDb.getSanitizedUserById(userId);
            broadcastToUser(userId, 'stamps');
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

assistantRouter.get('/users/get-user/:userId', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /get-user/:userId error', async () => {
        const userId = req.params.userId;
        const user = await usersDb.getById<UserModel>(userId);

        if (!user) {
            res
                .status(404)
                .json({
                    message: 'Nie znaleziono użytkownika.'
                });
            return;
        } else {
            res
                .status(200)
                .json({
                    _id: userId,
                    email: user?.email,
                    role: user?.role,
                    stamps: user?.stamps,
                });
            return;
        }

    }, (e) => {
        res
            .status(500)
            .json({
                message: 'Coś poszło źle!',
                details: e
            });
        return;
    });
})

assistantRouter.get('/:managerId', middleware.requireAssistant, async (req, res) => {
    Logs.appLogs.catchUnhandled('GET /:managerId', async () => {
        const userId = req.params.managerId;
        const sanitizedManager = await managersDb.getSanitizedManagerById(userId);
        if (!sanitizedManager) {
            res
                .status(404)
                .json({ message: 'Nie znaleziono managera.' });
            return;
        } else {
            res
                .status(200)
                .json(sanitizedManager);
            return;
        }
    }, (e) => {
        res
            .status(500)
            .json({
                message: 'Coś poszło źle!',
                details: (e as any)?.message ?? e
            });
        return;
    });
});

assistantRouter.get('', middleware.requireAssistant, async (req, res) => {
    Logs.appLogs.catchUnhandled('GET /assistants', async () => {
        const email = req.query.email as string;
        const page = req.query.page as string;
        const size = req.query.size as string;
        const pageNumber = parseInt(page) ?? 1;
        const pageSize = parseInt(size) ?? 10;

        if (typeof pageNumber !== 'number' || typeof pageSize !== 'number') {
            res.status(400).json({ message: 'Nieprawidłowa wartość "page" lub "size".' });
            return;
        }

        if (email && typeof email === 'string') {
            const assistantsData = await managersDb
                .getAllByField<ManagerModel>('email', email, { containPhrase: true, page: pageNumber, size: pageSize })
                .then((managersData) => {
                    const { items, hasMore } = managersData;
                    const sanitizedManagers: Document<SanitizedManagerModel>[] = [];
                    let i = 0;
                    for (const manager of items) {
                        const sanitizedUser = Tools.sanitizeUserOrAssistant(manager) as Document<SanitizedManagerModel>;
                        sanitizedManagers[i] = sanitizedUser;
                        i++;
                    }
                    return {
                        assistants: sanitizedManagers,
                        hasMore,
                    };
                });
            res.status(200).json({
                ...assistantsData,
                email,
            });
        } else {
            const assistantsData = await managersDb.getAll<ManagerModel>({ page: pageNumber, size: pageSize });
            const sanitizedAssistants = assistantsData.items.map(item => Tools.sanitizeUserOrAssistant(item));

            const adminsData = await adminsDb.getAll<AdminModel>({ page: pageNumber, size: pageSize });
            const sanitizedAdminsData = adminsData.items.map(item => Tools.sanitizeUserOrAssistant(item));
            res.status(200).json({
                assistants: sanitizedAssistants,
                hasMore: assistantsData.hasMore,
                admins: {
                    admins: sanitizedAdminsData,
                    hasMore: adminsData.hasMore,
                },
            });
        }
    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło nie tak podczas dostępu do managerów.',
            details: (e as any)?.message ?? e
        });
    });
});

assistantRouter.put('/:managerId/downgrade', middleware.requireAdmin, async (req, res) => {
    Logs.appLogs.catchUnhandled('PUT /:managerId/downgrade', async () => {
        const managerId = req.params.managerId;
        const manager = await managersDb.getById<ManagerModel>(managerId);
        if (!manager) {
            res
                .status(404)
                .json({ message: 'Nie znaleziono managera, któremu chcesz zabrać uprawnienia.' });
            return;
        }

        if (!manager.verification.isVerified) {
            res
                .status(400)
                .json({ message: 'Użytkownik któ®ego chcesz promować, nie zweryfikował jeszcze konta.' });
            return;
        }

        const removedManagerSuccess = await managersDb.removeItemById(manager._id);
        if (!removedManagerSuccess) {
            res
                .status(500)
                .json({ message: 'Odbieranie uprawnień asystenta przerwane: błąd operacji managersDb.removeItemById' });
            return;
        }

        const createdUserId = await usersDb.setById<UserModel>(manager._id, {
            _id: manager._id,
            email: manager.email,
            password: manager.password,
            role: UserRole.User,
            agreements: manager.agreements,
            verification: manager.verification,
            changePassword: manager.changePassword,
            card: await Tools.createCardId(),
            stamps: ((manager as any).stamps ?? {
                amount: 0,
                history: [],
            }) as any,
        });

        if (!createdUserId) {
            res
                .status(500)
                .json({ message: 'Nie udało się przenieść asystenta do roli użytkownika.' });
            return;
        }

        res
            .status(200)
            .json({
                userId: createdUserId,
                message: 'Asysten został przeniesiony do roli użytkownika.'
            });
        return;
    }, (e) => {
        res
            .status(500)
            .json({
                message: 'Coś poszło źle!',
                details: (e as any)?.message ?? e
            });
        return;
    });
});

export default assistantRouter;