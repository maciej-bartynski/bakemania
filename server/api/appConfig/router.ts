
import express, { Request, Response } from 'express';
import Middleware from '../../lib/middleware';
import appConfigQuery from './query';

const appConfigRouter = express.Router();

appConfigRouter.get('/get', async (req: Request, res: Response): Promise<void> => {
    try {

        const appConfig = await appConfigQuery.findAppConfig();

        if (appConfig) {
            res
                .status(200)
                .json(appConfig);
        } else {
            res
                .status(404)
                .json({
                    message: `Nie znaleziono konfiguracji "/app-config.`,
                });
        }

    } catch (error) {
        res
            .status(500)
            .json({
                message: 'Odczyt "/app-config" nie powiódł się.',
                details: error
            });

        return
    }
});

export default appConfigRouter;