import express from 'express';
import Logs from '../../services/LogService';
import tools from '../../lib/tools';
import appConfigDb from '../../services/DbService/instances/AppConfigDb';
import { AppConfig } from '../../services/DbService/instances/AppConfigDb.types';

const adminRouter = express.Router();

adminRouter.post('/users/:userId/change-role', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /users/:userId/change-role error', async () => {
        const { userId } = req.params;
        const { email, role } = req.body;
        const userByEmail = await tools.getUserOrAssistantByEmail(email);

        if (!userByEmail || userByEmail._id !== userId) {
            res.status(404).json({
                message: 'Nie znaleziono użytkownika.',
                userId: userId
            });
            return;
        }

        const updatedId = await tools.updarteUserOrAssistangById(userByEmail._id, {
            role
        });

        if (updatedId) {
            res.status(200).json({
                message: 'Rola użytkownika została zmieniona.',
                userId: updatedId
            });
            return;
        }

        res.status(404).json({
            message: 'Nie udało się zmienić roli użytkownika.',
            userId: userId
        });
        return;
    }, (e) => {
        res.status(500).json({
            message: 'Wystąpił błąd podczas zmiany roli użytkownika.',
            error: (e as any)?.message ?? e
        });
        return;
    })
});

adminRouter.patch('/app-config', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /app-config/change error', async () => {
        const { config } = req.body as { config: Partial<AppConfig> };

        if (!config || typeof config !== 'object') {
            res.status(400).json({
                message: 'Nieprawidłowa konfiguracja.',
                config: config
            });
            return;
        }

        const allowedFields = ['cardSize', 'discount', 'stampsInRow', 'maxCardsPerTransaction'];
        const keys = Object.keys(config);
        let errorMessage = '';
        keys.forEach(key => {
            const delimiter = errorMessage ? ' ' : '';
            if (!allowedFields.includes(key)) {
                errorMessage += `${delimiter}Pole "${key}" jest niedozwolone.`;
            } else {
                if (typeof config[key as keyof AppConfig] !== 'number') {
                    errorMessage += `${delimiter}Pole "${key}" musi być liczbą. `;
                }
            }
        });

        if (errorMessage) {
            res.status(400).json({
                message: errorMessage,
                config: config
            });
            return;
        }

        const currentConfigData = await appConfigDb.getAll<AppConfig>({
            page: 1,
            size: 1
        });
        const updatedId = currentConfigData?.items[0]?._id
            ? await appConfigDb.updateById<AppConfig>(currentConfigData.items[0]._id, config)
            : null;
        const updatedConfig = updatedId
            ? await appConfigDb.getById<AppConfig>(updatedId)
            : null;

        if (updatedConfig) {
            res.status(200).json({
                message: 'Konfiguracja została zmieniona.',
                config: updatedConfig
            });
            return;
        } else {
            res.status(404).json({
                message: 'Nie udało się zmienić konfiguracji aplikacji.',
                configId: updatedId
            });
            return;
        }

    }, (e) => {
        res.status(500).json({
            message: 'Wystąpił błąd podczas zmiany konfiguracji aplikacji.',
            error: (e as any)?.message ?? e
        });
    })
})

export default adminRouter;