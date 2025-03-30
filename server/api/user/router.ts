import express, { Request, Response } from 'express';
import Tools from '../../lib/tools';
import Logs from '../../services/LogService';

const router = express.Router();

router.get('/me', async (req: Request, res: Response) => {
    console.log("ME  test");

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
    console.log("remove - hit");

    try {
        console.log("req check: ", (req as any).user._id);
    } catch (e) {
        console.log("req check - error", e);
    }

    Logs.appLogs.catchUnhandled('Handler /me error', async () => {
        const userId = ((req as any).user as any)._id;

        try {
            console.log("userId check: ", userId);
        } catch (e) {
            console.log("userId check - error", e);
        }

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

export default router;