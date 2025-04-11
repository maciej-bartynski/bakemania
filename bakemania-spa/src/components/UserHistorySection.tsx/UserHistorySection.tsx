import { FC, useEffect, useState } from "react";
import { OtherUser } from "../../storage/users/users-types";
import AsidePanel from "../../atoms/AsidePanel/AsidePanel";
import PanelViewTemplate from "../../atoms/PanelViewTemplate/PanelViewTemplate";
import FooterNav from "../FooterNav/FooterNav";
import IconButton from "../../atoms/IconButton/IconButton";
import IconName from "../../icons/IconName";
import apiService from "../../services/ApiService";
import './UserHistorySection.css';
import Icon from "../../icons/Icon";
import useAppConfigSelector from "../../storage/appConfig/appConfig-selectors";
import UserShort from "../../atoms/UserShort/UserShort";
import HistoryEntry from "../../atoms/HistoryEntry/HistoryEntry";
import useMeSelector from "../../storage/me/me-selectors";
import assistantsAction from "../../storage/assistants/assistants-actions";
import useAppDispatch from "../../storage/useAppDispatch";
import useAssistantsSelector from "../../storage/assistants/users-selectors";
import AppUser from "../../atoms/AppUser/AppUser";
import UserRole from "../../storage/me/me-types";

const UserHistorySection: FC<{
    active: boolean,
    toggleActive: () => void,
    details: {
        userId: string,
    } | null,
    toggleCardDetailsView: (details: {
        userId: string,
        variant: 'spend' | 'earn',
        assistantId: string,
        cardId: string,
    }) => void,
}> = ({ active, details, toggleActive, toggleCardDetailsView }) => {

    const [user, setUser] = useState<OtherUser | null>(null);
    const { appConfig } = useAppConfigSelector();
    const { me } = useMeSelector();
    const dispatch = useAppDispatch();
    const { assistants, admins } = useAssistantsSelector();

    const allAssistants = [...assistants, ...(admins?.admins ?? [])];

    useEffect(() => {
        if (active) {
            dispatch(assistantsAction.fetchAssistants({ page: 1, size: user?.stamps.history.length ?? 10 }));
        }
    }, [active, dispatch, user]);

    useEffect(() => {
        const fetchUser = async () => {
            if (active && details?.userId) {
                const user = await apiService.fetch(`user/${details?.userId}`) as OtherUser;
                setUser(user ?? null);
            }
        }
        fetchUser();
    }, [active, details?.userId]);



    if (!appConfig || !user || !me) {
        return null;
    }

    const userGiftsAmount = Math.floor(user?.stamps.amount / appConfig.cardSize);

    return (
        <AsidePanel
            side='left'
            active={active}
        >
            <PanelViewTemplate
                title={<><Icon iconName={IconName.History} color='white' />Historia użytkownika</>}
                appBarClassName={`HistorySection__app-bar`}
                appBar={(
                    <>
                        <FooterNav>
                            <IconButton
                                iconColor='white'
                                bgColor='var(--text)'
                                onClick={toggleActive}
                                label='Wróć'
                                iconName={IconName.ArrowDown}
                            />
                        </FooterNav>
                    </>
                )}
            >
                <div className="HistorySection">

                    <UserShort
                        userId={user._id}
                        userEmail={user?.email}
                        userStampsAmount={user?.stamps.amount}
                        userGiftsAmount={userGiftsAmount}
                        userCard={user?.card}
                        isVerified={user?.verification.isVerified}
                        isAgreements={user?.agreements}
                        actionButtons={[
                            {
                                label: "Idź do karty",
                                onClick: () => {
                                    toggleCardDetailsView({
                                        userId: user._id,
                                        variant: 'spend',
                                        assistantId: '',
                                        cardId: 'change-force',
                                    })
                                },
                                icon: IconName.QrCode
                            }
                        ]}
                    />

                    <div className="HistorySection__header">
                        <div className="HistorySection__header-content">
                            <span>Historia klienta </span>
                            <AppUser email={user?.email ?? ''} role={UserRole.User} />
                        </div>
                    </div>
                    <div className="HistorySection__list">
                        {user?.stamps.history.map(entry => (
                            <HistoryEntry
                                key={entry._id}
                                createdAt={entry.createdAt}
                                by={entry.by}
                                balance={entry.balance}
                                assistantId={entry.assistantId}
                                assistantEmail={allAssistants?.find(assistant => assistant._id === entry.assistantId)?.email ?? "(nieznany)"}
                                userId={entry.userId}
                                cardSize={appConfig.cardSize}
                                toggleHistoryView={toggleActive}
                                toggleCardDetailsView={() => {
                                    toggleCardDetailsView({
                                        userId: user._id,
                                        variant: 'earn',
                                        assistantId: me._id,
                                        cardId: 'change-force',
                                    })
                                }}
                            />
                        ))}
                    </div>
                </div>
            </PanelViewTemplate>
        </AsidePanel>
    );
}

export default UserHistorySection;