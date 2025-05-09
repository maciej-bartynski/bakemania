import { FC, useEffect, useState } from "react";
import './SplashScreen.css';
import meActions from "../../storage/me/me-actions";
import useAppDispatch from "../../storage/useAppDispatch";
import useMeSelector from "../../storage/me/me-selectors";
import DashboardScreen from "../DashboardScreen/DashboardScreen";
import AssistantSection from "../AssistantSection/AssistantSection";
import Background from "../../atoms/Background/Background";
import clearSession from "../../tools/clearSession";
import useDebouncedCallback from "../../tools/useDebouncedCallback";
import Config from "../../config";
import { BrowserRouter } from "react-router";

type AppInitializedState = 'idle' | 'pending' | 'pristine' | 'error';

const SplashScreen: FC = () => {
    const [appInitialized, setAppInitialized] = useState<AppInitializedState>('pristine');
    const debouncedSetAppInitialized = useDebouncedCallback(() => {
        setAppInitialized('idle');
    }, 1000);

    const dispatch = useAppDispatch();
    const { me } = useMeSelector();

    useEffect(() => {
        async function init(): Promise<void> {
            const token = window.localStorage.getItem(Config.sessionKeys.Token);
            if (token) {
                await dispatch(meActions.fetchMe()).finally(() => {
                    debouncedSetAppInitialized();
                });
            } else {
                clearSession();
                setAppInitialized('error');
            }
        }

        if (appInitialized === 'pristine') {
            setAppInitialized('pending');
            init().then(() => {
                debouncedSetAppInitialized();
            }).catch(() => {
                setAppInitialized('error');
            });
        }
    }, [dispatch, debouncedSetAppInitialized, appInitialized]);

    if (appInitialized != 'idle') {
        return (
            <Background>
                <div className="splashScreen__loader-wrapper">
                    <div className={`global-loader-spinner --active`} />
                </div>
            </Background>
        );
    }

    if (me) {
        if (me.role != 'user') {
            return (
                <BrowserRouter>
                    <AssistantSection assistant={me} />
                </BrowserRouter>
            )
        }
        return (
            <BrowserRouter>
                <DashboardScreen me={me} />
            </BrowserRouter>
        )
    }

    return (
        <Background>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <span>Ups! Coś poszło nie tak :C</span>
            <button onClick={() => {
                window.location.reload();
            }}>
                Odśwież stronę
            </button>
        </Background>
    );
}

export default SplashScreen;