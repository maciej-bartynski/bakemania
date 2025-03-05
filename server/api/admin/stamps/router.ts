import express from 'express';
import Tools from '../../../lib/tools';
import stampsQueryForAdmin from './query';
import { broadcastToUser } from '../../../wsConnections';

const stampsRouter = express.Router();

stampsRouter.post('/increment', async (req, res) => {

    const { userId, amount } = req.body;

    if (typeof amount !== 'number') {
        res.status(400).json({ message: 'Ilość pieczątek musi być liczbą.' });
        return;
    }

    try {
        // const stampsDocId = await stampsQuery.stampsIncrementOne({ userId, amount });
        // const stampsDoc = await Tools.usersFindOne({ email: undefined, _id: userId })// await stampsQuery.stampsFindOne(stampsDocId);
        // res.status(200).json(stampsDoc);

        const userDoc = await Tools.usersFindOne({ email: undefined, _id: userId });
        const currentStamps = userDoc?.stamps?.amount ?? 0;
        const newStamps = currentStamps + amount;

        const _id = await stampsQueryForAdmin.stampsChangeAmount({ userId: userId as string, amount: newStamps });
        if (_id) {
            const userDoc = await Tools.usersFindOne({ email: undefined, _id });
            broadcastToUser(userId, 'stamps')
            res.status(200).json(userDoc);
        } else {
            res.status(500).json({ message: 'Coś poszło nie tak podczas zmiany ilości pieczątek.' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Coś poszło nie tak.', details: error });
    }
});

stampsRouter.post('/decrement', async (req, res) => {
    const { userId, amount } = req.body;

    if (typeof amount !== 'number') {
        res.status(400).json({ error: 'Ilość pieczątek musi być liczbą.' });
        return;
    }

    try {
        // const stampsDocId = await stampsQuery.stampsDecrementOne({ userId, amount });
        // const stampsDoc = await Tools.usersFindOne({ email: undefined, _id: userId })// await stampsQuery.stampsFindOne(stampsDocId);
        // res.status(200).json(stampsDoc);

        const userDoc = await Tools.usersFindOne({ email: undefined, _id: userId });
        const currentStamps = userDoc?.stamps?.amount ?? 0;
        const newStamps = currentStamps - amount;

        const _id = await stampsQueryForAdmin.stampsChangeAmount({ userId: userId as string, amount: newStamps });
        if (_id) {
            const userDoc = await Tools.usersFindOne({ email: undefined, _id });
            broadcastToUser(userId, 'stamps')
            res.status(200).json(userDoc);
        } else {
            res.status(500).json({ message: 'Coś poszło nie tak podczas zmiany ilości pieczątek.' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Coś poszło nie tak.', details: error });
    }
});

stampsRouter.post('/change', async (req, res) => {

    const { userId, amount } = req.body ?? {};

    if (typeof amount !== 'number' || amount < 0) {
        res.status(400).json({ message: 'Ilość pieczątek musi być liczbą całkowitą dodatnią.' });
        return;
    }

    if (typeof userId !== 'string') {
        res.status(400).json({ message: 'Id użytkownika jest wymagany.' });
        return;
    }

    try {
        const _id = await stampsQueryForAdmin.stampsChangeAmount({ userId: userId as string, amount });
        if (_id) {
            const userDoc = await Tools.usersFindOne({ email: undefined, _id });
            broadcastToUser(userId, 'stamps')
            res.status(200).json(userDoc);
        } else {
            res.status(500).json({ message: 'Coś poszło nie tak podczas zmiany ilości pieczątek.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Coś poszło nie tak.', details: error });
    }
});

export default stampsRouter;