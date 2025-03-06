import { Me } from "../storage/me/me-types";

class ClientLogsService {

    constructor() {
    }

    report(message: string, details?: Record<string, unknown> | string | unknown) {

        const myself = window.localStorage.getItem('me');
        let me: Me | null = null;
        if (myself) {
            try {
                me = JSON.parse(myself);
            } catch {
                me = myself as unknown as Me;
            }
        }

        try {
            const options = {
                method: 'post',
                body: JSON.stringify({
                    message,
                    details: {
                        User: me ?? null,
                        'What happend': details ?? message,
                    }
                }),
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${window.localStorage.getItem('token')}`
                }
            };

            window.fetch(`/api/client-logs`, options)

        } catch (e) {
            console.warn('Loging service failed', e)
        }
    }
}

export default ClientLogsService
