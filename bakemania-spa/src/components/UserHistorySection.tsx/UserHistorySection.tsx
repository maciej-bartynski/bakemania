import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import UserRole, { StampsHistoryEntry } from "../../storage/me/me-types";
import { useParams } from "react-router";
import useAppNavigation from "../../tools/useAppNavigation";
import DateFormatter from "../../tools/formatCreatedAt";

const { formatReadbleDateToOperationalDate, sortByDateDesc } = DateFormatter;

const UserHistorySection: FC = () => {
    const { setScanningForceRoute } = useAppNavigation();
    const { appConfig } = useAppConfigSelector();
    const { me } = useMeSelector();
    const params = useParams<{
        userId: string
    }>();

    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive(prev => !prev), []);
    useEffect(() => {
        if (!me || !appConfig) {
            return
        }
        setActive(true);
    }, [me, appConfig])

    const userId = params.userId ?? '';
    const [user, setUser] = useState<OtherUser | null>(null);
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
            if (active && userId) {
                const user = await apiService.fetch(`user/${userId}`) as OtherUser;
                setUser(user ?? null);
            }
        }
        fetchUser();
    }, [active, userId]);

    const sortedHistory: StampsHistoryEntry[] = useMemo(() => {
        return sortByDateDesc(user?.stamps.history ?? []);
    }, [user?.stamps.history]) as StampsHistoryEntry[]

    if (!appConfig || !user || !me) {
        return null;
    }

    const userGiftsAmount = Math.floor(user?.stamps.amount / appConfig.cardSize);

    return (
        <AsidePanel
            side='right'
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
                                    setScanningForceRoute({
                                        userId: userId,
                                        operation: 'earn-for-amount',
                                    });
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
                        {sortedHistory.map(entry => (
                            <HistoryEntry
                                key={entry._id}
                                createdAt={formatReadbleDateToOperationalDate(entry.createdAt)}
                                by={entry.by}
                                balance={entry.balance}
                                assistantId={entry.assistantId}
                                assistantEmail={allAssistants?.find(assistant => assistant._id === entry.assistantId)?.email ?? "(nieznany)"}
                                userId={entry.userId}
                                cardSize={appConfig.cardSize}
                            />
                        ))}
                    </div>
                </div>
            </PanelViewTemplate>
        </AsidePanel>
    );
}

export default UserHistorySection;
