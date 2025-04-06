import { FC, useEffect } from 'react';
import './UsersSection.css';
import FooterNav from '../FooterNav/FooterNav';
import IconName from '../../icons/IconName';
import useMeSelector from '../../storage/me/me-selectors';
import useAppConfigSelector from '../../storage/appConfig/appConfig-selectors';
import AsidePanel from '../../atoms/AsidePanel/AsidePanel';
import PanelViewTemplate from '../../atoms/PanelViewTemplate/PanelViewTemplate';
import UsersList from './elements/UsersList';
import Icon from '../../icons/Icon';
import usersActions from '../../storage/users/users-actions';
import useAppDispatch from '../../storage/useAppDispatch';

const UsersSection: FC<{
    active: boolean;
    toggleActive: () => void;
    toggleCardDetailsView: (details?: {
        variant: "spend" | "earn";
        userId: string,
    }) => void
}> = ({
    active,
    toggleActive,
    toggleCardDetailsView
}) => {
        const { me } = useMeSelector();
        const { appConfig } = useAppConfigSelector();
        const dispatch = useAppDispatch();

        useEffect(() => {
            if (active) {
                dispatch(usersActions.fetchUsers({ page: 1, size: 10, email: '' }));
            }
        }, [active, dispatch])


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
                                        action: toggleActive,
                                        icon: IconName.ArrowDown,
                                    },
                                ]}
                            />
                        </>
                    )}
                >

                    <UsersList
                        headerElement={<strong>Zarządzaj gośćmi</strong>}
                        userAction={{
                            label: 'Zarządzaj',
                            action: (user) => {
                                toggleCardDetailsView({
                                    variant: 'earn',
                                    userId: user._id,
                                })
                            },
                            icon: <Icon iconName={IconName.Cog} color="white" />
                        }}
                    />

                    <br />
                    <br />

                </PanelViewTemplate>
            </AsidePanel>
        );
    };

export default UsersSection;