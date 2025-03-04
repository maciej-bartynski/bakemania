import express, { Request, Response } from 'express';
import Middleware from '../../lib/middleware';
import Tools from '../../lib/tools';

const router = express.Router();

router.get('/me', Middleware.authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = ((req as any).user as any)._id;
        const user = await Tools.usersFindOne({ _id: userId, email: undefined });
        const email = user?.email ?? '';
        const stamps = user?.stamps;
        const role = user?.role;

        if (!user) {
            res
                .status(404)
                .json({
                    message: `Brak użytkownika z identyfikatorem: ${userId ?? "(brak)"}.`,
                });
            return;
        }

        res
            .status(200)
            .json({
                _id: userId,
                email,
                role,
                stamps
            });

        return
    } catch (error) {
        console.log("errr?", error)
        res
            .status(500)
            .json({
                message: 'Odczyt "/me" nie powiódł się.',
                details: error
            });

        return
    }
});

export default router;