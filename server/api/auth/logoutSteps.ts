import { Response } from 'express';
import fs from 'fs';
import path from 'path';

function logoutSteps(userId: string, res: Response) {

    const subscriptionFile = path.join('./db/sessions', `${userId}.json`);

    return fs.access(subscriptionFile, fs.constants.F_OK, (err) => {

        if (err) {
            return res.sendStatus(204)
        }

        fs.unlink(subscriptionFile, (err) => {
            if (err) {
                return res
                    .status(500)
                    .json({
                        message: 'Unlink went wrong.',
                        details: err
                    });
            }
            return res
                .sendStatus(204)
        });

    });

}

export default logoutSteps;