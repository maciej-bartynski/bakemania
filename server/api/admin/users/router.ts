import express from 'express';
import usersQueryForAdmin from './query';
import tools from '../../../lib/tools';
import usersDb from '../../../services/DbService/instances/UsersDb';
import { UserModel } from '../../../services/DbService/instances/UsersDb.types';
import Logs from '../../../services/LogService';

const usersRouterForAdmin = express.Router();

usersRouterForAdmin.get('/get', async (req, res) => {
    Logs.appLogs.catchUnhandled('Handler /get error', async () => {
        // const { userId, amount } = req.body;

        // const users = usersQueryForAdmin.getUsers();


        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const size = req.query.size ? parseInt(req.query.size as string) : 10;

        const users = await usersDb.getAll<UserModel>({
            page,
            size,
        });

        if (!users || !users.length || !(users instanceof Array)) {
            res.status(404).json({ message: 'Nie znaleziono użytkowników.' });
            return;
        }

        res.status(200).json(users);
        return;
    }, (e) => {
        res.status(500).json({
            message: 'Ups... przypalilśmy serwer :C',
            details: {
                error: e,
                route: 'admin/users/get',
            }
        });
        return;
    });
});

usersRouterForAdmin.get('/get-user/:userId', async (req, res) => {
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

export default usersRouterForAdmin;