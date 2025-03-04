import express from 'express';
import Middleware from '../../lib/middleware';
import Tools from '../../lib/tools';
import Models from '../../lib/models';
import fs from 'fs';
import webPush from 'web-push';

const router = express.Router();

router.get('/get-vapid-public-key', (req, res) => {
    res.json({ publicKey: 'mock-key', /* process.env.VAPID_PUBLIC_KEY */ });
});

router.put('/receive-notification/:userId', Middleware.authenticateToken, Middleware.requireAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
        const existingSubscription = await Tools.subscriptionsFindOne({ userId: userId });

        if (!existingSubscription) {
            res.status(404).json({
                error: 'Subscription not found'
            });
        } else {
            const userToPing = await Tools.usersFindOne({ _id: userId, email: undefined });
            if (userToPing) {
                const payload = JSON.stringify({
                    title: `Message to: ${userToPing.email}`,
                    body: `Hello, ${userToPing.email}!`,
                });

                await webPush.sendNotification(existingSubscription, payload);

                res.json({ message: 'User pinged successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to ping user', details: err });
    }
});

router.post('/subscribe', Middleware.authenticateToken, async (req, res) => {
    const { endpoint, keys } = req.body;

    try {
        const existingSubscription = await Tools.subscriptionsFindOne({ userId: ((req as any).user as any)._id });
        if (existingSubscription) {
            existingSubscription.endpoint = endpoint;
            existingSubscription.keys = keys;
            fs.writeFileSync(`./db/subscriptions/${existingSubscription.userId}.json`, JSON.stringify(existingSubscription, null, 2));
        } else {
            const newSubscription = new Models.PushSubscriptionModel({
                userId: ((req as any).user as any)._id,
                endpoint,
                keys,
            }).toJSON();
            fs.writeFileSync(`./db/subscriptions/${newSubscription.userId}.json`, JSON.stringify(newSubscription, null, 2));
        }

        res.status(201).json({ message: 'Subscription saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save subscription', details: error });
    }
});

export default router;