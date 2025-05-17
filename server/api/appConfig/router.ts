
import express, { Request, Response } from 'express';
import appConfigDb from '../../services/DbService/instances/AppConfigDb';
import { AppConfig } from '../../services/DbService/instances/AppConfigDb.types';

const appConfigRouter = express.Router();

appConfigRouter.get('/get', async (req: Request, res: Response): Promise<void> => {
    try {

        //const appConfig = await appConfigQuery.findAppConfig();
        const { items: appConfigs, hasMore } = await appConfigDb.getAll<AppConfig>({
            page: 1,
            size: 1,
        });
        const appConfig = appConfigs[0];
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