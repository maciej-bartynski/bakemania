import { noticesStore } from "../storage/notices-store";
import noticesSlice from "../storage/notices/notices-reducer";
import * as uuid from 'uuid';
import ClientLogsService from "./LogsService";

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
                ...init.headers,
                'content-type': 'application/json',
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
            } : {
                'content-type': 'application/json',
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
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
                const rejectionData = await response.json();
                throw rejectionData;
            })
            .catch(rejectionData => {
                const clientLogs = new ClientLogsService();

                clientLogs.report('Error on ApiService', {
                    Url: input,
                    'Request data': init,
                    'Expected statuses': expectedStatuses,
                    'What happend': rejectionData?.message || rejectionData || `${rejectionData}`
                });

                let errorMessage = "";

                if (typeof rejectionData === 'string') {
                    /**
                     * Api error with status text only
                     */
                    errorMessage += `${rejectionData}`;
                } else if (rejectionData && rejectionData.message) {
                    /**
                     * Api error with data
                     */
                    errorMessage += `${rejectionData.message}`;
                } else {
                    /**
                     * Parsing errors, network errors etc
                     */
                    errorMessage += `${rejectionData}`;
                }

                console.error(errorMessage);

                try {
                    noticesStore.dispatch(noticesSlice.actions.addNotice({
                        _id: uuid.v4(),
                        body: errorMessage,
                    }))
                } catch (e) {
                    console.warn(e);
                }

            });
    }
}

const apiService = new ApiService();

export default apiService;