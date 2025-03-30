import express, { Request, Response } from 'express';
import Middleware from '../../lib/middleware';
import Tools from '../../lib/tools';
import Logs from '../../services/LogService';
import usersDb from '../../services/DbService/instances/UsersDb';

const router = express.Router();

router.get('/me', Middleware.authenticateToken, async (req: Request, res: Response) => {


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

router.delete('/remove-account', Middleware.authenticateToken, async (req: Request, res: Response) => {
    Logs.appLogs.catchUnhandled('Handler /me error', async () => {
        const userId = ((req as any).user as any)._id;
        console.log('userId', userId);
        const sanitizedUser = await Tools.getUserOrAssistantById(userId);
        console.log('sanitizedUser', sanitizedUser);
        if (!sanitizedUser) {
            console.log('brak uzytkownika');
            res.status(404).json({
                message: `Brak użytkownika z identyfikatorem: ${userId ?? "(brak)"}.`,
            });
            return;
        }

        return await Tools.removeUserOrAssistangById(userId).then(() => {
            console.log('niby sukces');
            res.status(204).send();
            return;
        }).catch((e) => {
            console.log('co tu sie dzieje:', e);
            res.status(500).json({ message: 'Nie udało się usunąć użytkownika', details: JSON.stringify((e as any)?.message ?? e) });
            throw e;
        });

        console.log('przeszlo');

    }, (e) => {
        console.log('error ostateczny', e);
        res.status(500).json({
            message: '"/remove-account" nie powiodło się.',
            details: JSON.stringify((e as any)?.message ?? e)
        });
        return;
    });
});

export default router;