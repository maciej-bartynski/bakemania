import { FC } from 'react';
import './UsersSection.css';
import FooterNav from '../FooterNav/FooterNav';
import IconName from '../../icons/IconName';
import useMeSelector from '../../storage/me/me-selectors';
import useAppConfigSelector from '../../storage/appConfig/appConfig-selectors';
import AsidePanel from '../../atoms/AsidePanel/AsidePanel';
import PanelViewTemplate from '../../atoms/PanelViewTemplate/PanelViewTemplate';
import UsersList from '../../atoms/UsersList/UsersList';

const UsersSection: FC<{
    active: boolean;
    toggleActive: () => void;
    toggleCardDetailsView: (details?: {
        cardId: string;
        variant: "spend" | "earn";
    }) => void
}> = ({
    active,
    toggleActive,
    toggleCardDetailsView
}) => {
        const { me } = useMeSelector();
        const { appConfig } = useAppConfigSelector();


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
                        setUserEditId={(cardId: string) => {
                            toggleCardDetailsView({
                                cardId,
                                variant: 'earn'
                            })
                        }}
                    />
                </PanelViewTemplate>
            </AsidePanel>
        );
    };

export default UsersSection;