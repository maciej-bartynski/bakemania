import { FC, useEffect, useState } from 'react';
import './UsersSection.css';
import FooterNav from '../FooterNav/FooterNav';
import IconName from '../../icons/IconName';
import useMeSelector from '../../storage/me/me-selectors';
import useAppConfigSelector from '../../storage/appConfig/appConfig-selectors';
import AsidePanel from '../../atoms/AsidePanel/AsidePanel';
import PanelViewTemplate from '../../atoms/PanelViewTemplate/PanelViewTemplate';
import UsersList from './elements/UsersList';
import usersActions from '../../storage/users/users-actions';
import useAppDispatch from '../../storage/useAppDispatch';
import useAppNavigation from '../../tools/useAppNavigation';

const UsersSection: FC = () => {
    const { setScanningForceRoute, setHomeRoute, setCustomerRoute } = useAppNavigation();

    const { me } = useMeSelector();
    const { appConfig } = useAppConfigSelector();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(usersActions.fetchUsers({ page: 1, size: 10, email: '' }));
    }, [dispatch])

    const [active, setActive] = useState(false);

    useEffect(() => {
        if (!me || !appConfig) {
            return
        }
        setActive(true);
    }, [me, appConfig])

    if (!me || !appConfig) {
        return 'Ładowanie...'
    }

    return (
        <AsidePanel
            side='left'
            active={active}
        >
            <PanelViewTemplate
                title='Zarządzaj gośćmi'
                appBar={(
                    <>
                        <FooterNav
                            actions={[
                                {
                                    label: 'Wróć',
                                    action: () => setHomeRoute({
                                        delay: 250,
                                        beforeNavigate: () => setActive(false)
                                    }),
                                    icon: IconName.ArrowDown,
                                },
                            ]}
                        />
                    </>
                )}
            >

                <UsersList
                    userActions={[{
                        label: 'Operacje',
                        action: (user) => {
                            setScanningForceRoute({
                                userId: user._id,
                                operation: 'earn-for-amount',
                            });
                        },
                        icon: IconName.QrCode
                    }, {
                        label: "Historia",
                        action: (user) => setCustomerRoute(user._id, {
                            delay: 250,
                            beforeNavigate: () => setActive(false)
                        }),
                        icon: IconName.History
                    }]}
                />

                <br />
                <br />

            </PanelViewTemplate>
        </AsidePanel>
    );
};

export default UsersSection;