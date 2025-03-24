import { noticesStore } from "../storage/notices-store";
import noticesSlice from "../storage/notices/notices-reducer";
import * as uuid from 'uuid';
import ClientLogsService from "./LogsService";
import getConsole from "../tools/getConsole";
import clearSession from "../tools/clearSession";
import Config from "../config";

interface ApiServiceInterface {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

class ApiService implements ApiServiceInterface {
    fetch(input: RequestInfo | URL, init?: RequestInit, expectedStatuses = [200]) {

        const options = {
            ...(init || {}),
            method: init?.method ?? 'get',
            body: init?.body ?? undefined,
            headers: init?.headers ? {
                'content-type': 'application/json',
                'Authorization': `Bearer ${window.localStorage.getItem(Config.sessionKeys.Token)}`,
                ...init.headers,
            } : {
                'content-type': 'application/json',
                'Authorization': `Bearer ${window.localStorage.getItem(Config.sessionKeys.Token)}`
            }
        };

        return window.fetch(`/api/${input}`, options)
            .then(async response => {
                if (expectedStatuses.includes(response.status)) {
                    if (response.status === 204) {
                        /** 
                         * Success status code, no body 
                         * */
                        return response.statusText ?? 'Success';
                    }
                    /** 
                     * Success status code, expect body 
                     * */
                    return response.json();
                }
                /** 
                 * Rejection status code, body expected 
                 * */

                if (response.status === 401) {
                    try {
                        const rejectionData = await response.json();
                        noticesStore.dispatch(noticesSlice.actions.addNotice({
                            _id: uuid.v4(),
                            header: 'Aby kontynuować zaloguj się (ponownie).',
                            body: rejectionData.message,
                        }))
                    } catch (e) {
                        getConsole().error('Something wrong when parsing 401: ', e);
                        noticesStore.dispatch(noticesSlice.actions.addNotice({
                            _id: uuid.v4(),
                            header: 'Aby kontynuować zaloguj się (ponownie).',
                            body: 'Obecna sesja wygasła.',
                        }));
                        clearSession();
                    }
                } else {
                    try {
                        const rejectionData = await response.json();
                        const clientLogs = new ClientLogsService();
                        clientLogs.report('Rejection on ApiService', {
                            Url: input,
                            'Request data': init,
                            'Expected statuses': expectedStatuses,
                            'Response status': response.status,
                            'Response status text': response.statusText,
                            'What happend': rejectionData?.message || rejectionData || `${rejectionData}`
                        });
                        noticesStore.dispatch(noticesSlice.actions.addNotice({
                            _id: uuid.v4(),
                            header: `${response.status}: ${input}`,
                            body: rejectionData?.message || rejectionData || `${rejectionData}`,
                        }))
                    } catch (err) {
                        getConsole().error('Something wrong when parsing rejection: ', err);
                        const clientLogs = new ClientLogsService();
                        clientLogs.report('Rejection on ApiService, error on parsing rejection', {
                            Url: input,
                            'Request data': init,
                            'Expected statuses': expectedStatuses,
                            'Response status': response.status,
                            'Response status text': response.statusText,
                            // eslint-disable-next-line
                            'Catched error': `${(err as any)?.message ?? err}`
                        });
                        noticesStore.dispatch(noticesSlice.actions.addNotice({
                            _id: uuid.v4(),
                            header: `${response.status}: ${input}`,
                            body: 'Coś poszło źle',
                        }))
                    }
                }
            })
            .catch(rejectionData => {
                getConsole().error('Unexpected catch: ', rejectionData?.message ?? rejectionData);
                noticesStore.dispatch(noticesSlice.actions.addNotice({
                    _id: uuid.v4(),
                    header: 'Nieokreślony błąd',
                    body: rejectionData?.message ?? rejectionData,
                }))

            });
    }
}

const apiService = new ApiService();

export default apiService;