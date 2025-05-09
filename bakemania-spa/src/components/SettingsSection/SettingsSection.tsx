import { FC, useCallback, useEffect, useState } from "react";
import AsidePanel from "../../atoms/AsidePanel/AsidePanel";
import FooterNav from "../FooterNav/FooterNav";
import IconName from "../../icons/IconName";
import './SettingsSection.css';
import PanelViewTemplate from "../../atoms/PanelViewTemplate/PanelViewTemplate";
import BottomPanel from "../../atoms/BottomPanel/BottomPanel";
import clearSession from "../../tools/clearSession";
import apiService from "../../services/ApiService";
import Icon from "../../icons/Icon";
import useMeSelector from "../../storage/me/me-selectors";
import { OtherUser } from "../../storage/users/users-types";
import HistoryEntry from "../../atoms/HistoryEntry/HistoryEntry";
import useAppConfigSelector from "../../storage/appConfig/appConfig-selectors";
import AppUser from '../../atoms/AppUser/AppUser';
import useAppDispatch from "../../storage/useAppDispatch";
import meActions from "../../storage/me/me-actions";
import UserRole from "../../storage/me/me-types";
import useAppNavigation from "../../tools/useAppNavigation";

const SettingsSection: FC = () => {
    const { me } = useMeSelector();
    const { appConfig } = useAppConfigSelector();
    const { setScanningRoute, setCustomerRoute, setHomeRoute } = useAppNavigation();
    const [active, setActive] = useState(false);
    useEffect(() => {
        if (!me || !appConfig) {
            setActive(false);
            return
        }
        setActive(true);
    }, [me, appConfig])

    const dispatch = useAppDispatch();
    const [showLogoutPanel, setShowLogoutPanel] = useState(false);
    const [showDestroyPanel, setShowDestroyPanel] = useState(false);


    const toggleLogoutPanel = useCallback(() => {
        setShowDestroyPanel(false)
        setShowLogoutPanel(state => !state);
    }, [])

    const toggleDestroyPanel = useCallback(() => {
        setShowLogoutPanel(false)
        setShowDestroyPanel(state => !state);
    }, []);

    const [users, setUsers] = useState<OtherUser[]>([]);

    const [prevstate, setPrevstate] = useState(active);

    useEffect(() => {
        setPrevstate(active);
    }, [active])

    useEffect(() => {

        if (me?.role === UserRole.User || me === null) {
            return;
        }

        async function fetchUsersForUserHistory() {

            dispatch(meActions.fetchMe());
            const operationsHistory = me?.transactionsHistory;

            if (operationsHistory instanceof Array && operationsHistory?.length > 0) {
                const userIds = operationsHistory.reduce((acc, curr) => {
                    acc.push(curr.userId);
                    return acc;
                }, [] as string[]);

                const uniqueUserIds = [...new Set(userIds)];

                const data = await apiService.fetch(`user?ids[]=${uniqueUserIds.join(',')}`, {
                    method: 'GET',
                }, [200]);

                setUsers(data.users);
            }
        }

        if (active && prevstate === false) {
            fetchUsersForUserHistory();
        }
    }, [me?.transactionsHistory, active, dispatch, prevstate, me])

    if (!me) {
        return null;
    }

    const isManagerOrAdmin = me.role === 'manager' || me.role === 'admin';

    return (
        <AsidePanel
            active={active}
            side="right"
        >
            <PanelViewTemplate
                title="Ustawienia"
                appBar={(
                    <>
                        <FooterNav
                            actions={[
                                {
                                    label: 'Wróć',
                                    action: () => {
                                        setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) });
                                    },
                                    icon: IconName.ArrowDown,
                                }
                            ]}
                        />

                        <BottomPanel
                            title="Chcesz się wylogować?"
                            show={showLogoutPanel}
                            toggleBottomPanel={toggleLogoutPanel}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    gap: 10
                                }}>

                                <button
                                    onClick={() => {
                                        clearSession();
                                        window.location.reload();
                                    }}
                                    className="secondary"
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    Tak
                                </button>

                                <button
                                    onClick={toggleLogoutPanel}
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    Wróć
                                </button>

                            </div>
                        </BottomPanel>

                        <BottomPanel
                            title="Usuwanie konta - ta opcja jest nieodwracalna"
                            show={showDestroyPanel}
                            toggleBottomPanel={toggleDestroyPanel}
                            variant="danger"
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    gap: 10
                                }}>

                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => {
                                        apiService.fetch('user/remove-account', {
                                            method: 'DELETE',
                                        }, [204]).then(() => {
                                            clearSession();
                                            window.location.reload();
                                        }).catch(() => {
                                            alert('Nie udało się usunąć konta');
                                        });
                                    }}
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    Usuwam konto!
                                </button>

                                <button
                                    onClick={toggleDestroyPanel}
                                    style={{
                                        flex: 1,
                                    }}
                                >
                                    Wróć
                                </button>

                            </div>
                        </BottomPanel>
                    </>
                )}
            >
                <div className="settings-section-field">
                    <button
                        className="settings-section-field__account-button settings-section-field__account-button--logout"
                        onClick={toggleLogoutPanel}
                    >
                        <Icon
                            iconName={IconName.LogOut}
                            color="var(--text)"
                        />
                        <span>
                            Wyloguj się
                        </span>
                    </button>
                </div>

                <div className="settings-section-field">
                    <button
                        className="settings-section-field__account-button settings-section-field__account-button--delete"
                        onClick={toggleDestroyPanel}
                    >
                        <Icon
                            iconName={IconName.Destroy}
                            color="#ff4444"
                        />
                        <span>
                            Usuń konto
                        </span>
                    </button>
                </div>

                {isManagerOrAdmin && (
                    <div className="settings-section-field">
                        <h2 className="settings-section-field__history-header">
                            <div className="settings-section-field__history-header-content">
                                <span>Operacje moderowane przez </span>
                                <AppUser email={me.email} role={me.role} />
                            </div>
                        </h2>
                        <div className="settings-section-field__history-list">
                            {me.transactionsHistory?.length ? [...me.transactionsHistory].reverse().map(entry => (
                                <HistoryEntry
                                    key={entry._id}
                                    createdAt={entry.createdAt}
                                    by={entry.by}
                                    balance={entry.balance}
                                    userEmail={users.find(user => user._id === entry.userId)?.email ?? '-'}
                                    cardSize={appConfig?.cardSize ?? 0}
                                    assistantId={me._id}
                                    userId={entry.userId}
                                    operations={(
                                        isExpanded: boolean,
                                        setIsExpanded: (param: boolean) => void
                                    ) => {
                                        return (
                                            <>
                                                <button
                                                    className="HistoryEntry__detailsButton"
                                                    onClick={() => setIsExpanded(!isExpanded)}
                                                >
                                                    <Icon iconName={IconName.Cog} color='var(--customer)' width={20} height={20} />
                                                </button>

                                                <div className={`HistoryEntry__options ${isExpanded ? 'HistoryEntry__options--expanded' : ''}`}>
                                                    <div className="HistoryEntry__optionsContent">
                                                        <button
                                                            className="HistoryEntry__option"
                                                            style={{
                                                                color: 'var(--customer)',
                                                                strokeWidth: 2
                                                            }}
                                                            onClick={() => {
                                                                setScanningRoute({
                                                                    cardId: 'change-force',
                                                                    userId: entry.userId,
                                                                    operation: 'spend',
                                                                });
                                                            }}
                                                        >
                                                            <Icon iconName={IconName.QrCode} color='var(--customer)' width={16} height={16} />
                                                            Operacje
                                                        </button>
                                                        <button
                                                            className="HistoryEntry__option"
                                                            style={{
                                                                color: 'var(--customer)',
                                                                strokeWidth: 2
                                                            }}
                                                            onClick={() => {
                                                                setCustomerRoute(entry.userId);
                                                            }}
                                                        >
                                                            <Icon iconName={IconName.History} color='var(--customer)' width={16} height={16} />
                                                            Użytkownik
                                                        </button>
                                                        <button
                                                            className="HistoryEntry__option"
                                                            onClick={() => setIsExpanded(false)}
                                                            style={{
                                                                strokeWidth: 2
                                                            }}
                                                        >
                                                            <Icon iconName={IconName.ArrowDown} width={16} height={16} />
                                                            Schowaj
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    }}
                                />
                            )) : null}
                        </div>
                    </div>
                )}
            </PanelViewTemplate>

        </AsidePanel>
    )
}

export default SettingsSection;