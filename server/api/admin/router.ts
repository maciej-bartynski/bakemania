import express from 'express';
import Logs from '../../services/LogService';
import tools from '../../lib/tools';
import appConfigDb from '../../services/DbService/instances/AppConfigDb';
import { AppConfig } from '../../services/DbService/instances/AppConfigDb.types';
import fs from 'fs';
import archiver from 'archiver';
import path from 'path';
import EmailService from '../../services/EmailService/EmailService';
import extract from 'extract-zip';
import fileUpload from 'express-fileupload';
import os from 'os';

const adminRouter = express.Router();

adminRouter.use(fileUpload());

adminRouter.post('/users/:userId/change-role', async (req: express.Request, res: express.Response) => {
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

        const updatedId = await tools.updateUserOrAssistantById(userByEmail._id, {
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

adminRouter.get('/db-copy', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /db-copy', async () => {
        const dbPath = path.resolve(process.cwd(), './db');
        const chunks: Buffer[] = [];
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });
        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', async () => {
            const zipBuffer = Buffer.concat(chunks);
            const success = await EmailService.sendBackup(zipBuffer);
            if (success) {
                res.status(200).json({
                    message: 'Backup został wysłany emailem.',
                    success: true
                });
            } else {
                res.status(500).json({
                    message: 'Nie udało się wysłać backupu emailem.',
                    success: false
                });
            }
        });

        archive.directory(dbPath, 'db-backup');
        await archive.finalize();
    }, (e) => {
        res.status(500).json({
            message: 'Error while copying database.',
            error: (e as any)?.message ?? e
        });
    });
});

adminRouter.post('/db-upload', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /db-upload', async () => {
        if (!req.files || !req.files.file) {
            res.status(400).json({
                message: 'Nie przesłano pliku.',
                success: false
            });
            return;
        }

        const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
        const allowedTypes = ['.zip'];
        const fileExt = path.extname(file.name).toLowerCase();

        if (!allowedTypes.includes(fileExt)) {
            res.status(400).json({
                message: 'Niedozwolony format pliku. Dozwolony format to .zip',
                success: false
            });
            return;
        }

        const dbCopyPath = path.resolve(process.cwd(), './db-copy');

        if (fs.existsSync(dbCopyPath)) {
            res.status(400).json({
                message: 'Kopia została już wgrana.',
                success: false
            });
            return;
        }

        try {
            fs.mkdirSync(dbCopyPath);
            const tempPath = path.join(os.tmpdir(), file.name);
            await file.mv(tempPath);
            await extract(tempPath, { dir: dbCopyPath });
            fs.unlinkSync(tempPath);

            res.status(200).json({
                message: 'Baza danych została przywrócona.',
                success: true
            });
        } catch (error) {
            if (fs.existsSync(dbCopyPath)) {
                fs.rmSync(dbCopyPath, { recursive: true });
            }

            res.status(500).json({
                message: 'Wystąpił błąd podczas rozpakowywania archiwum.',
                error: (error as any)?.message ?? error,
                success: false
            });
        }

    }, (e) => {
        res.status(500).json({
            message: 'Error while restoring database.',
            error: (e as any)?.message ?? e,
            success: false
        });
    });
});

adminRouter.delete('/db-copy/remove', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /db-copy/remove', async () => {
        const dbCopyPath = path.resolve(process.cwd(), './db-copy');

        if (!fs.existsSync(dbCopyPath)) {
            res.status(404).json({
                message: 'Folder db-copy nie istnieje.',
                success: false
            });
            return;
        }

        try {
            fs.rmSync(dbCopyPath, { recursive: true });
            res.status(200).json({
                message: 'Folder db-copy został usunięty.',
                success: true
            });
        } catch (error) {
            res.status(500).json({
                message: 'Wystąpił błąd podczas usuwania folderu db-copy.',
                error: (error as any)?.message ?? error,
                success: false
            });
        }
    }, (e) => {
        res.status(500).json({
            message: 'Error while removing db-copy folder.',
            error: (e as any)?.message ?? e,
            success: false
        });
    });
});

adminRouter.post('/db-copy/restore', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /db-copy/restore', async () => {
        const { confirmation } = req.body;

        if (confirmation !== 'studiujem prawo') {
            res.status(400).json({
                message: 'Nieprawidłowe potwierdzenie.',
                success: false
            });
            return;
        }

        const dbCopyPath = path.resolve(process.cwd(), './db-copy');
        const dbBackupPath = path.join(dbCopyPath, 'db-backup');
        const dbPath = path.resolve(process.cwd(), './db');
        const tempPath = path.join(os.tmpdir(), 'db-restore-temp');

        if (!fs.existsSync(dbCopyPath)) {
            res.status(404).json({
                message: 'Folder db-copy nie istnieje.',
                success: false
            });
            return;
        }

        if (!fs.existsSync(dbBackupPath)) {
            res.status(404).json({
                message: 'Folder db-backup nie istnieje w db-copy.',
                success: false
            });
            return;
        }

        try {
            // Utwórz tymczasowy folder
            if (fs.existsSync(tempPath)) {
                fs.rmSync(tempPath, { recursive: true });
            }
            fs.mkdirSync(tempPath);

            // Skopiuj zawartość db-backup do tymczasowego folderu
            const copyRecursive = (src: string, dest: string) => {
                const entries = fs.readdirSync(src, { withFileTypes: true });

                for (const entry of entries) {
                    const srcPath = path.join(src, entry.name);
                    const destPath = path.join(dest, entry.name);

                    if (entry.isDirectory()) {
                        fs.mkdirSync(destPath);
                        copyRecursive(srcPath, destPath);
                    } else {
                        fs.copyFileSync(srcPath, destPath);
                    }
                }
            };

            copyRecursive(dbBackupPath, tempPath);

            // Usuń pliki z folderu db pojedynczo
            const deleteRecursive = (dir: string) => {
                if (fs.existsSync(dir)) {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        if (entry.isDirectory()) {
                            deleteRecursive(fullPath);
                            fs.rmdirSync(fullPath);
                        } else {
                            fs.unlinkSync(fullPath);
                        }
                    }
                }
            };

            // Usuń zawartość folderu db
            deleteRecursive(dbPath);

            // Przenieś pliki z tymczasowego folderu do db
            copyRecursive(tempPath, dbPath);

            // Usuń tymczasowy folder
            fs.rmSync(tempPath, { recursive: true });

            res.status(200).json({
                message: 'Baza danych została przywrócona.',
                success: true
            });
        } catch (error) {
            // W przypadku błędu, spróbuj wyczyścić tymczasowy folder
            if (fs.existsSync(tempPath)) {
                try {
                    fs.rmSync(tempPath, { recursive: true });
                } catch (e) {
                    // Ignoruj błędy podczas czyszczenia
                }
            }

            res.status(500).json({
                message: 'Wystąpił błąd podczas przywracania bazy danych.',
                error: (error as any)?.message ?? error,
                success: false
            });
        }
    }, (e) => {
        res.status(500).json({
            message: 'Error while restoring database.',
            error: (e as any)?.message ?? e,
            success: false
        });
    });
});

adminRouter.get('/db-copy/confirm-exists', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /db-copy/confirm-exists', async () => {
        const dbCopyPath = path.resolve(process.cwd(), './db-copy');
        const exists = fs.existsSync(dbCopyPath);

        res.status(200).json({
            exists,
            success: true
        });
    }, (e) => {
        res.status(500).json({
            message: 'Error while checking db-copy existence.',
            error: (e as any)?.message ?? e,
            success: false
        });
    });
});

adminRouter.delete('/flush-logs', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /flush-logs', async () => {
        const logsPath = path.resolve(process.cwd(), './logs');
        const requiredDirs = ['app', 'email', 'client', 'ws-server'];


        // Usuń zawartość folderu logs pojedynczo
        const deleteRecursive = (dir: string) => {
            if (fs.existsSync(dir)) {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        deleteRecursive(fullPath);
                        fs.rmdirSync(fullPath);
                    } else {
                        fs.unlinkSync(fullPath);
                    }
                }
            }
        };

        // Usuń zawartość folderu logs
        deleteRecursive(logsPath);

        // Utwórz wymagane katalogi
        for (const dir of requiredDirs) {
            const dirPath = path.join(logsPath, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }

        res.status(200).json({
            message: 'Logi zostały wyczyszczone i struktura katalogów została odtworzona.',
            success: true
        });

    }, (e) => {
        res.status(500).json({
            message: 'Error while flushing logs.',
            error: (e as any)?.message ?? e,
            success: false
        });
    });
});

export default adminRouter;