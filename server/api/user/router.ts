import express, { Request, Response } from 'express';
import Middleware from '../../lib/middleware';
import Tools from '../../lib/tools';
import Logs from '../../services/LogService';

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

export default router;