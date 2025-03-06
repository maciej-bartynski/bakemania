import express from 'express';
import usersQueryForAdmin from './query';
import tools from '../../../lib/tools';

const usersRouterForAdmin = express.Router();

usersRouterForAdmin.get('/get', async (req, res) => {

    // const { userId, amount } = req.body;

    const users = usersQueryForAdmin.getUsers();

    if (!users || !users.length || !(users instanceof Array)) {
        res.status(404).json({ message: 'Nie znaleziono użytkowników.' });
        return;
    }

    res.status(200).json(users);
});

usersRouterForAdmin.get('/get-user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await tools.usersFindOne({ _id: userId, email: undefined });
        if (!user) {
            res
                .status(404)
                .json({
                    message: 'Nie znaleziono użytkownika.'
                });
        }

        res
            .status(200)
            .json({
                _id: userId,
                email: user?.email,
                role: user?.role,
                stamps: user?.stamps,
            });
    } catch (e) {
        res
            .status(500)
            .json({
                message: 'Coś poszło źle!'
            });
    }

})

export default usersRouterForAdmin;