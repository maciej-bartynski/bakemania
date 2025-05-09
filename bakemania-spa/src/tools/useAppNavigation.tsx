import { useCallback } from "react";
import { useNavigate } from "react-router";

const useAppNavigation = () => {
    const navigate = useNavigate();

    const setScanningRoute = useCallback((params: {
        cardId: string,
        userId: string,
        operation: 'spend' | 'earn' | 'earn-for-amount' | 'delete'
    }) => {

        navigate(`/scan/${params.userId}/${params.cardId}/${params.operation}`);
    }, [navigate]);

    const setCustomerRoute = useCallback((userId: string, params?: {
        beforeNavigate: () => void;
        delay: number
    }) => {
        if (params && params.beforeNavigate && params.delay) {
            params.beforeNavigate();
            setTimeout(() => navigate(`/user/${userId}`), params.delay)
        } else {
            navigate(`/user/${userId}`);
        }
    }, [navigate]);

    const setUsersRoute = useCallback((params?: {
        beforeNavigate: () => void;
        delay: number
    }) => {
        if (params && params.beforeNavigate && params.delay) {
            params.beforeNavigate();
            setTimeout(() => navigate('/users'), params.delay)
        } else {
            navigate('/users');
        }
    }, [navigate]);

    const setSettingsRoute = useCallback((params?: {
        beforeNavigate: () => void;
        delay: number
    }) => {
        if (params && params.beforeNavigate && params.delay) {
            params.beforeNavigate();
            setTimeout(() => navigate('/settings'), params.delay)
        } else {
            navigate('/settings');
        }
    }, [navigate]);

    const setManageRoute = useCallback((params?: {
        beforeNavigate: () => void;
        delay: number
    }) => {
        if (params && params.beforeNavigate && params.delay) {
            params.beforeNavigate();
            setTimeout(() => navigate('/manage'), params.delay)
        } else {
            navigate('/manage');
        }
    }, [navigate]);

    const setHomeRoute = useCallback((params?: {
        beforeNavigate: () => void;
        delay: number
    }) => {
        if (params && params.beforeNavigate && params.delay) {
            params.beforeNavigate();
            setTimeout(() => navigate('/'), params.delay)
        } else {
            navigate('/');
        }
    }, [navigate]);

    return {
        setScanningRoute,
        setUsersRoute,
        setHomeRoute,
        setCustomerRoute,
        setSettingsRoute,
        setManageRoute
    }
}

export default useAppNavigation;