import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import useMeSelector from "../storage/me/me-selectors";
import * as uuid from 'uuid';
import useAppDispatch from "../storage/useAppDispatch";
import meActions from "../storage/me/me-actions";
import { LiveUpdateContext } from "./LiveUpdateContext";
import UserRole from "../storage/me/me-types";
import ClientLogsService from "../services/LogsService";

const LiveUpdateProvider: FC<PropsWithChildren> = ({ children }) => {

    const { me } = useMeSelector();
    const dispatch = useAppDispatch();

    const stampsUpdationRef = useRef<NodeJS.Timeout | null>(null);
    const [stampsUpdated, _setStampsUpdated] = useState(false);
    const setStampsUpdated = useCallback(() => {
        _setStampsUpdated(true);
        stampsUpdationRef.current = setTimeout(() => {
            _setStampsUpdated(false);
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            if (stampsUpdationRef.current) clearTimeout(stampsUpdationRef.current);
        }
    }, [])

    const webSocketServerRef = useRef<WebSocket | null>(null);
    const sessionIdRef = useRef<string>(uuid.v4());

    useEffect(() => {
        if (me && me.role === UserRole.User) {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    return;
                }

                const previousServer = webSocketServerRef.current;

                if (previousServer) {
                    previousServer.close();
                    sessionIdRef.current = uuid.v4();
                }

                // const newServer = new WebSocket(`${import.meta.env.VITE_WS_URL}`, [token, sessionIdRef.current]);
                const newServer = new WebSocket(`/ws`, [token, sessionIdRef.current]);
                webSocketServerRef.current = newServer;

                newServer.onopen = () => {
                    try {
                        newServer.send("WS initial ping from client");
                    } catch (e) {
                        const clientLogsService = new ClientLogsService();
                        clientLogsService.report('WebSocked error on open', e);
                    }
                }

                newServer.onmessage = async (msg) => {
                    try {
                        if (msg?.data === 'stamps') {
                            await dispatch(meActions.fetchMe());
                            setStampsUpdated();
                        }
                    } catch (e) {
                        const clientLogsService = new ClientLogsService();
                        clientLogsService.report('WebSocked error on message', {
                            'This was error': e,
                            'This was message': msg
                        });
                    }
                };

            } catch (e) {
                const clientLogsService = new ClientLogsService();
                clientLogsService.report('LiveUpdateProvider error on mount', e);
            }
        }
    }, [me, dispatch, setStampsUpdated]);

    const context = useMemo(() => ({
        stampsUpdated,
        setStampsUpdated
    }), [
        stampsUpdated,
        setStampsUpdated
    ])

    return (
        <LiveUpdateContext.Provider value={context}>
            {children}
        </LiveUpdateContext.Provider>
    )
}

export default LiveUpdateProvider;