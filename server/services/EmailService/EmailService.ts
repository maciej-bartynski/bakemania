import nodemailer from 'nodemailer';
import { UserModel } from '../DbService/instances/UsersDb.types';
import getLocalIP from '../../lib/getLocalIP';
import Logs from '../LogService';
import { ManagerModel } from '../DbService/instances/ManagersDb.types';
import { AdminModel } from '../DbService/instances/AdminsDb.types';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // if (process.env.NODE_ENV === 'production') {
        //     // OVH SMTP
        //     this.transporter = nodemailer.createTransport({
        //         host: process.env.SMTP_HOST,
        //         port: 587,
        //         secure: false,
        //         auth: {
        //             user: process.env.SMTP_USER,
        //             pass: process.env.SMTP_PASSWORD
        //         }
        //     });
        // } else {
        //     // Gmail dla developmentu
        //     this.transporter = nodemailer.createTransport({
        //         service: 'gmail',
        //         auth: {
        //             user: process.env.EMAIL_USER,
        //             pass: process.env.EMAIL_APP_PASSWORD
        //         }
        //     });
        // }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
    }

    async sendChangePasswordEmail(user: UserModel | ManagerModel | AdminModel, token: string): Promise<boolean> {
        return await Logs.emailLogs.catchUnhandled<boolean>('[EmailService] sendChangePasswordEmail() failure', async () => {
            const frontendPort = 3000;
            let domainAndPort = 'localhost:' + frontendPort;
            if (process.env.NODE_ENV !== 'production') {
                domainAndPort = getLocalIP() + ':' + frontendPort;
            } else {
                domainAndPort = process.env.DOMAIN || domainAndPort;
            }
            const verificationLink = `https://${domainAndPort}/reset-password?token=${token}`;
            const subject = 'bakeMAnia -  zmiana hasła 🔐';
            const html = `<h1>Link do zmiany hasła</h1>
                <p>Otrzymujesz tę wiadomość, ponieważ ktoś poprosił o zmianę hasła dla Twojego konta bakeMAnia.<br/>
                To nie ty? Prosimy, poinformuj nas o tym.<br/><br/>
                Aby zmienić hasło, kliknij w przycisk poniżej:</p> 
                <br/><br/>
                <p>
                    <a 
                        href="${verificationLink}"
                        style="
                            padding: 10px 20px;
                            border: solid 1px black;
                            border-radius: 6px;
                            font-family: sans-serif;
                            background: black;
                            color: white;
                        "
                    >
                        Zmieniam hasło! 🔓
                    </a>
                </p>
                <br/><br/>
                <p>Możesz też wkleić ten link do przeglądarki:</p>
                <br/><br/>
                <p>${verificationLink}</p>
                <br/><br/>
                <p>Widzimy się w bakeMAnii? ☕️ 🍪 🍰</p>`;

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: user.email,
                subject,
                html: html
            });

            return true;
        }, async () => {
            return false;
        }) ?? false;
    }

    async sendVerificationEmail(user: UserModel): Promise<boolean> {
        return await Logs.emailLogs.catchUnhandled<boolean>('[EmailService] sendVerificationEmail() failure', async () => {
            const frontendPort = 3000;
            let domainAndPort = 'localhost:' + frontendPort;
            if (process.env.NODE_ENV !== 'production') {
                domainAndPort = getLocalIP() + ':' + frontendPort;
            } else {
                domainAndPort = process.env.DOMAIN || domainAndPort;
            }
            const verificationLink = `https://${domainAndPort}/email-verification?token=${user.verification.token}`;
            const subject = 'bakeMAnia -  weryfikacja adresu email 🥧';
            const html = `<h1>Weryfikacja adresu email</h1>
                <p>Kliknij w przycisk poniżej:</p> 
                <br/><br/>
                <p>
                    <a 
                        href="${verificationLink}"
                        style="
                            padding: 10px 20px;
                            border: solid 1px black;
                            border-radius: 6px;
                            font-family: sans-serif;
                            background: black;
                            color: white;
                        "
                    >
                        Kliknij tutaj! 🥧
                    </a>
                </p>
                <br/><br/>
                <p>lub skopiuj i wklej ten link do przeglądarki:</p>
                <br/><br/>
                <p>${verificationLink}</p>
                <br/><br/>
                <p>Widzimy się w bakeMAnii? ☕️ 🍪 🍰</p>`;

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: user.email,
                subject,
                html: html
            });

            return true;
        }, async () => {
            return false;
        }) ?? false;
    }
}

export default new EmailService();