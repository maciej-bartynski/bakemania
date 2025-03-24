import { FC, useCallback, useEffect } from "react";
import './SplashScreen.css';
import meActions from "../../storage/me/me-actions";
import useAppDispatch from "../../storage/useAppDispatch";
import useMeSelector from "../../storage/me/me-selectors";
import DashboardScreen from "../DashboardScreen/DashboardScreen";
import AssistantSection from "../AssistantSection/AssistantSection";
import Background from "../../atoms/Background/Background";
import Authorization from "../../components/Authorization/Authorization";

const SplashScreen: FC = () => {

    const dispatch = useAppDispatch();

    const {
        me,
    } = useMeSelector();


    const logOut = useCallback(async () => {
        if (window.localStorage.getItem('token')) {
            dispatch(meActions.logOut());
        }
    }, [dispatch]);


    useEffect(() => {
        async function init(): Promise<void> {
            const token = window.localStorage.getItem('token');
            if (token) {
                await dispatch(meActions.fetchMe());
            } else {
                logOut();
            }
        }
        init();
    }, [dispatch, logOut]);

    let toRender = (
        <Background>
            <Authorization />
        </Background>
    )

    if (me) {
        if (me.role != 'user') {
            toRender = (
                <AssistantSection
                    assistant={me}
                />
            )
        } else {
            toRender = (
                <DashboardScreen
                    me={me}
                    logOut={logOut}
                />
            )
        }
    }

    return toRender
}

export default SplashScreen;