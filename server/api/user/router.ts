import express, { Request, Response } from 'express';
import Tools from '../../lib/tools';
import Logs from '../../services/LogService';
import usersDb from '../../services/DbService/instances/UsersDb';
import UserRole, { SanitizedUserModel, UserModel } from '../../services/DbService/instances/UsersDb.types';
import middleware from '../../lib/middleware';
import { ManagerModel } from '../../services/DbService/instances/ManagersDb.types';
import managersDb from '../../services/DbService/instances/ManagersDb';
import { Document } from '../../services/DbService/DbTypes';
const router = express.Router();

router.get('/me', async (req: Request, res: Response) => {
    Logs.appLogs.catchUnhandled('Handler /me error', async () => {
        const userId = ((req as any).user as any)._id;
        const sanitizedUser = await Tools.getSanitizedUserOrAssistantById(userId);

        if (!sanitizedUser) {
            res.status(404).json({
                message: `Brak użytkownika z identyfikatorem: ${userId ?? "(brak)"}.`,
            });
            return;
        }

        res.status(200).json(sanitizedUser);
        return;

    }, (e) => {
        res.status(500).json({
            message: 'Odczyt "/me" nie powiódł się.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
});

router.delete('/remove-account', async (req: Request, res: Response) => {
    Logs.appLogs.catchUnhandled('Handler /me error', async () => {
        const userId = ((req as any).user as any)._id;
        const sanitizedUser = await Tools.getUserOrAssistantById(userId);
        if (!sanitizedUser) {
            res.status(404).json({
                message: `Brak użytkownika z identyfikatorem: ${userId ?? "(brak)"}.`,
            });
            return;
        }

        return await Tools.removeUserOrAssistangById(userId).then(() => {
            res.status(204).send();
            return;
        }).catch((e) => {
            res.status(500).json({ message: 'Nie udało się usunąć użytkownika', details: JSON.stringify((e as any)?.message ?? e) });
            throw e;
        });
    }, (e) => {
        res.status(500).json({
            message: '"/remove-account" nie powiodło się.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
});

router.get('/:userId', middleware.requireAssistant, async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /:userId error', async () => {
        const userId = req.params.userId;
        const sanitizedUser = await usersDb.getSanitizedUserById(userId);
        if (!sanitizedUser) {
            res
                .status(404)
                .json({ message: 'Nie znaleziono użytkownika.' });
            return;
        } else {
            res
                .status(200)
                .json(sanitizedUser);
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

router.get('', middleware.requireAssistant, async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /users error', async () => {
        const userIds = req.query.ids as string[];
        const email = req.query.email as string;
        const page = req.query.page as string;
        const size = req.query.size as string;
        const pageNumber = parseInt(page) ?? 1;
        const pageSize = parseInt(size) ?? 10;

        console.log(userIds);


        if (typeof pageNumber !== 'number' || typeof pageSize !== 'number') {
            res.status(400).json({ message: 'Nieprawidłowa wartość "page" lub "size".' });
            return;
        }

        if (userIds && userIds instanceof Array && userIds.length > 0) {
            const ids = userIds[0].split(',');
            const usersData = await usersDb
                .getAllByFileNames<UserModel>(ids);

            const saniUsers: Document<SanitizedUserModel>[] = usersData.map((user) => Tools.sanitizeUserOrAssistant(user) as Document<SanitizedUserModel>)

            res.status(200).json({
                users: saniUsers
            });
            return;
        }
        else if (email && typeof email === 'string') {
            const sanitizedUsersData = await usersDb
                .getAllByField<UserModel>('email', email, { containPhrase: true, page: pageNumber, size: pageSize })
                .then((usersData) => {
                    const { items, hasMore } = usersData;
                    const sanitizedUsers: Document<SanitizedUserModel>[] = [];
                    let i = 0;
                    for (const user of items) {
                        const sanitizedUser = Tools.sanitizeUserOrAssistant(user) as Document<SanitizedUserModel>;
                        sanitizedUsers[i] = sanitizedUser;
                        i++;
                    }
                    return {
                        users: sanitizedUsers,
                        hasMore
                    };
                });
            res.status(200).json({
                users: sanitizedUsersData.users,
                hasMore: sanitizedUsersData.hasMore,
            });
        } else {
            const pageNumber = parseInt(page) ?? 1;
            const pageSize = parseInt(size) ?? 10;
            if (typeof pageNumber === 'number' && typeof pageSize === 'number') {
                const usersData = await usersDb.getAll<UserModel>({ page: pageNumber, size: pageSize });
                const { items, hasMore } = usersData;
                const sanitizedUsers: Document<SanitizedUserModel>[] = [];
                let i = 0;
                for (const user of items) {
                    const sanitizedUser = Tools.sanitizeUserOrAssistant(user) as Document<SanitizedUserModel>;
                    sanitizedUsers[i] = sanitizedUser;
                    i++;
                }
                res.status(200).json({
                    users: sanitizedUsers,
                    hasMore: hasMore,
                });
            } else {
                res.status(400).json({ message: 'Nieprawidłowa wartość "page" lub "size".' });
            }
        }
    }, (e) => {
        res.status(500).json({
            message: 'Coś poszło nie tak podczas dostępu do danych użytkowników.',
            details: (e as any)?.message ?? e
        });
    });
});

router.put('/:userId/promote', middleware.requireAdmin, async (req, res) => {
    Logs.appLogs.catchUnhandled('PUT /:userId/promote', async () => {
        const userId = req.params.userId;
        const user = await usersDb.getById<UserModel>(userId);
        if (!user) {
            res
                .status(404)
                .json({ message: 'Nie znaleziono użytkownika, którego chcesz promować.' });
            return;
        }

        if (!user.verification.isVerified) {
            res
                .status(400)
                .json({ message: 'Użytkownik któ®ego chcesz promować, nie zweryfikował jeszcze konta.' });
            return;
        }

        const removedUserSuccess = await usersDb.removeItemById(user._id);
        if (!removedUserSuccess) {
            res
                .status(500)
                .json({ message: 'Promocja użytkownika przerwana: błąd operacji usersDb.removeItemById' });
            return;
        }

        const userCustomerData = {
            stamps: user.stamps,
            card: user.card,
        }

        const createdAssistantId = await managersDb.setById<ManagerModel>(user._id, {
            _id: user._id,
            email: user.email,
            password: user.password,
            role: UserRole.Manager,
            transactionsHistory: [],
            agreements: user.agreements,
            verification: user.verification,
            changePassword: user.changePassword,
            ...userCustomerData,
        });

        if (!createdAssistantId) {
            res
                .status(500)
                .json({ message: 'Nie udało się stworzyć asystenta.' });
            return;
        }

        res
            .status(200)
            .json({
                assistantId: createdAssistantId,
                message: 'Użytkownik został promowany na asystenta.'
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

export default router;