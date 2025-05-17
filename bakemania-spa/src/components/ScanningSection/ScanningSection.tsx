import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import './ScanningSection.css';
import FooterNav from '../FooterNav/FooterNav';
import IconName from '../../icons/IconName';
import AsidePanel from '../../atoms/AsidePanel/AsidePanel';
import PanelViewTemplate from '../../atoms/PanelViewTemplate/PanelViewTemplate';
import apiService from '../../services/ApiService';
import useAppConfigSelector from '../../storage/appConfig/appConfig-selectors';
import { OtherUser } from '../../storage/users/users-types';
import UpdateOverlay from '../../atoms/UpdateOverlay/UpdateOverlay';
import useMeSelector from '../../storage/me/me-selectors';
import IconButton from '../../atoms/IconButton/IconButton';
import Earn from './elements/Earn';
import Spend from './elements/Spend';
import Delete from './elements/Delete';
import EarnForAmount from './elements/EarnForAmount';
import TabButton from '../../atoms/TabButton/TabButton';
import { useParams } from 'react-router';
import useAppNavigation from '../../tools/useAppNavigation';
import Icon from '../../icons/Icon';
import AppUser from '../../atoms/AppUser/AppUser';
import OperationIcon from '../../atoms/OperationIcon/OperationIcon';
import Operations from '../../tools/operations';

const ScanningSection: FC = () => {
    const { appConfig } = useAppConfigSelector();
    const me = useMeSelector();
    const [active, setActive] = useState(false);
    const { setScanningRoute, setHomeRoute, setCustomerRoute } = useAppNavigation();
    useEffect(() => {
        if (!me || !appConfig) {
            return
        }
        setActive(true);
    }, [me, appConfig])

    const params = useParams<{
        userId: string,
        cardId: string,
        operation: 'spend' | 'earn' | 'delete' | 'earn-for-amount'
    }>();

    const cardId = params.cardId;
    const userId = params.userId;
    const operation = params.operation as 'spend' | 'earn' | 'delete' | 'earn-for-amount';
    const assistantId = me.me?._id;

    const setVariant = useCallback((newVariant: 'spend' | 'earn' | 'delete' | 'earn-for-amount') => {
        if (!userId || !cardId) {
            return;
        }
        setScanningRoute({
            cardId,
            userId,
            operation: newVariant
        })
    }, [setScanningRoute, cardId, userId]);

    const [updateOverlayConfig, setUpdateOverlayConfig] = useState<{
        title?: ReactNode,
        message: ReactNode,
        operation: Operations | 'warning'
    } | null>(null);

    const [isUserLoading, setUserLoading] = useState(false);
    const [userToManage, setUserToManage] = useState<OtherUser | null>(null);

    useEffect(() => {
        async function fetchUserToManage() {
            if (userId) {
                setUserLoading(true);
                const userToManage = await apiService.fetch(`user/${userId}`) as OtherUser;
                if (userToManage) {
                    setUserToManage(userToManage);
                }
                setUserLoading(false);
            }
        }

        if (userId) fetchUserToManage();
    }, [userId]);

    const earnStamps = useCallback(async (amount: number): Promise<void> => {

        if (amount <= 0) {
            setUpdateOverlayConfig({
                title: <div className='ScanningSection__updateOverlay-title-warning'>Niewłaściwa ilość</div>,
                message: (
                    <div className='ScanningSection__updateOverlay-stamps-earned'>
                        <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                            Wprowadź poprawną ilość
                        </span>
                    </div>
                ),
                operation: 'warning'
            });

            return;
        };

        setUserLoading(true);
        await apiService.fetch('assistant/stamps/change', {
            method: 'POST',
            body: JSON.stringify({
                amount,
                userId,
                cardHash: cardId,
                assistantId
            })
        }).then(user => {
            setUserToManage(user);
        }).finally(() => {
            setUserLoading(false);
        });

        setUpdateOverlayConfig({
            title: <div className='ScanningSection__updateOverlay-title-stamp-addition'>Dodano</div>,
            message: (
                <div className='ScanningSection__updateOverlay-stamps-earned'>
                    <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                        <strong>{amount}</strong> {stampsLabel(amount)}
                    </span>
                    <span className='ScanningSection__updateOverlay-stamps-earned-text-small'>
                        do konta
                    </span>{userToManage ? <AppUser
                        email={userToManage?.email}
                        role={userToManage?.role}
                    /> : 'klienta'}
                </div>
            ),
            operation: Operations.StampAddition
        });
    }, [setUpdateOverlayConfig, cardId, userId, assistantId, userToManage]);

    const spentStamps = useCallback(async (amount: number): Promise<void> => {
        if (!appConfig) {
            return;
        }

        if (amount <= 0) {
            setUpdateOverlayConfig({
                title: <div className='ScanningSection__updateOverlay-title-warning'>Niewłaściwa ilość</div>,
                message: (
                    <div className='ScanningSection__updateOverlay-stamps-earned'>
                        <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                            Wprowadź poprawną ilość
                        </span>
                    </div>
                ),
                operation: 'warning'
            });
            return;
        }

        const userCardsAmount = amount / appConfig.cardSize;
        if (userCardsAmount > appConfig.maxCardsPerTransaction) {
            setUpdateOverlayConfig({
                title: <div className='ScanningSection__updateOverlay-title-warning'>Ilość kart jest za duża</div>,
                message: (
                    <div className='ScanningSection__updateOverlay-stamps-earned'>
                        <span className='ScanningSection__updateOverlay-stamps-earned-text-small'>
                            W jednej transakcji można wymienić maksymalnie
                        </span>
                        <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                            <strong>{appConfig?.maxCardsPerTransaction}</strong> {cardsLabelForWarning(appConfig?.maxCardsPerTransaction)}
                        </span>
                    </div>
                ),
                operation: 'warning'
            });
            return;
        }

        setUserLoading(true);
        await apiService.fetch('assistant/stamps/change', {
            method: 'POST',
            body: JSON.stringify({
                amount: -amount,
                userId,
                cardHash: cardId,
                assistantId
            })
        }).then(user => {
            setUserToManage(user);
        }).finally(() => {
            setUserLoading(false);
        });

        if (appConfig?.cardSize) {
            if (amount % appConfig.cardSize === 0) {
                setUpdateOverlayConfig({
                    title: <div className='ScanningSection__updateOverlay-title-gift'>Przyznano rabat</div>,
                    message: (
                        <div className='ScanningSection__updateOverlay-stamps-earned'>
                            <span className='ScanningSection__updateOverlay-stamps-earned-text-small'>
                                dla
                            </span>
                            {userToManage ? <AppUser
                                email={userToManage?.email}
                                role={userToManage?.role}
                            /> : 'klienta'}
                            <div />
                            <div>
                                <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                                    <strong>{amount / appConfig.cardSize}</strong> {cardsLabel(amount / appConfig.cardSize)}
                                </span>
                                <span className='ScanningSection__updateOverlay-stamps-earned-text-small'>
                                    {' '}={' '}
                                </span>
                                <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                                    <strong>{(amount / appConfig.cardSize) * appConfig.discount}</strong> PLN
                                </span>
                            </div>
                        </div>
                    ),
                    operation: Operations.GiftExchange
                });
                return;
            }
        }

        setUpdateOverlayConfig({
            title: <div className='ScanningSection__updateOverlay-title-stamp-removal'>Odjęto</div>,
            message: (
                <div className='ScanningSection__updateOverlay-stamps-earned'>
                    <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                        <strong>{amount}</strong> {stampsLabel(amount)}
                    </span>
                    <span className='ScanningSection__updateOverlay-stamps-earned-text-small'>
                        z konta
                    </span>{userToManage ? <AppUser
                        email={userToManage?.email}
                        role={userToManage?.role}
                    /> : 'klienta'}
                </div>
            ),
            operation: Operations.StampRemoval
        });
    }, [
        appConfig,
        setUpdateOverlayConfig,
        cardId,
        userId,
        assistantId,
        userToManage
    ]);

    const deleteStamps = useCallback(async (amount: number): Promise<void> => {
        if (amount <= 0) {
            setUpdateOverlayConfig({
                title: <div className='ScanningSection__updateOverlay-title-warning'>Niewłaściwa ilość</div>,
                message: (
                    <div className='ScanningSection__updateOverlay-stamps-earned'>
                        <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                            Wprowadź poprawną ilość
                        </span>
                    </div>
                ),
                operation: 'warning'
            });
            return;
        }

        setUserLoading(true);
        await apiService.fetch('assistant/stamps/change', {
            method: 'POST',
            body: JSON.stringify({
                amount: -amount,
                userId,
                cardHash: cardId,
                assistantId
            })
        }).then(user => {
            setUserToManage(user);
        }).finally(() => {
            setUserLoading(false);
        });

        setUpdateOverlayConfig({
            title: <div className='ScanningSection__updateOverlay-title-stamp-removal'>Odjęto</div>,
            message: (
                <div className='ScanningSection__updateOverlay-stamps-earned'>
                    <span className='ScanningSection__updateOverlay-stamps-earned-text-big'>
                        <strong>{amount}</strong> {stampsLabel(amount)}
                    </span>
                    <span className='ScanningSection__updateOverlay-stamps-earned-text-small'>
                        z konta
                    </span>{userToManage ? <AppUser
                        email={userToManage?.email}
                        role={userToManage?.role}
                    /> : 'klienta'}
                </div>
            ),
            operation: Operations.StampRemoval
        });
    }, [setUpdateOverlayConfig, cardId, userId, assistantId, userToManage]);

    const renderTabs = () => {
        return (

            <div className="ScanningSection__tabs">
                <TabButton
                    activeColor={"var(--earn-stamp)"}
                    iconName={IconName.Stamp}
                    label="Nabij"
                    onClick={() => setVariant('earn')}
                    selected={operation === 'earn'}
                />
                <TabButton
                    activeColor={"var(--earn-stamp)"}
                    iconName={IconName.StampForCash}
                    label="Za kwotę"
                    onClick={() => setVariant('earn-for-amount')}
                    selected={operation === 'earn-for-amount'}
                />
                <TabButton
                    activeColor={"var(--bakemaniaGold)"}
                    iconName={IconName.Gift}
                    label="Rabat"
                    onClick={() => setVariant('spend')}
                    selected={operation === 'spend'}
                />
                <TabButton
                    activeColor={"var(--remove-stamp)"}
                    iconName={IconName.StampRemove}
                    label="Skasuj"
                    onClick={() => setVariant('delete')}
                    selected={operation === 'delete'}
                />
                <div
                    className="ScanningSection__tabs-indicator-short"
                    style={{
                        backgroundColor: getTabColor(operation ?? 'earn'),
                    }}
                />
            </div>

        )
    }

    if (!userId || !cardId) {
        return (
            <AsidePanel
                side='left'
                active={active}
            >
                <PanelViewTemplate
                    title='Coś poszło nie źle'
                    appBar={(
                        <>
                            <FooterNav>
                                <IconButton
                                    iconColor='white'
                                    bgColor='var(--text)'
                                    onClick={() => setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) })}
                                    label='Wróć'
                                    iconName={IconName.ArrowDown}
                                />
                            </FooterNav>
                        </>
                    )}
                >
                    Zeskanuj ponownie kartę użytkownika.<br />
                    Jeśli problem będzie się powtarzał,<br />
                    niech użytkownik zaloguje się ponownie.
                </PanelViewTemplate>
            </AsidePanel>
        );
    }

    const renderActionPanel = () => {
        if (appConfig && userToManage) {
            if (operation === 'earn') {
                return (
                    <Earn
                        user={userToManage}
                        appConfig={appConfig}
                        earnStamps={earnStamps}
                        goHistoryView={() => setCustomerRoute(userId, { delay: 250, beforeNavigate: () => setActive(false) })}
                        renderTabs={renderTabs}
                    />
                );
            } else if (operation === 'spend') {
                return (
                    <Spend
                        user={userToManage}
                        appConfig={appConfig}
                        spendStamps={spentStamps}
                        goHistoryView={() => setCustomerRoute(userId, { delay: 250, beforeNavigate: () => setActive(false) })}
                        renderTabs={renderTabs}
                    />
                );
            } else if (operation === 'delete') {
                return (
                    <Delete
                        user={userToManage}
                        deleteStamps={deleteStamps}
                        appConfig={appConfig}
                        goHistoryView={() => setCustomerRoute(userId, { delay: 250, beforeNavigate: () => setActive(false) })}
                        renderTabs={renderTabs}
                    />
                );
            } else if (operation === 'earn-for-amount') {
                return (
                    <EarnForAmount
                        user={userToManage}
                        appConfig={appConfig}
                        earnStamps={earnStamps}
                        goHistoryView={() => setCustomerRoute(userId, { delay: 250, beforeNavigate: () => setActive(false) })}
                        renderTabs={renderTabs}
                    />
                );
            }
        }

        return 'Coś poszło nie tak...';
    };

    const getTabColor = (variant: 'spend' | 'earn' | 'delete' | 'earn-for-amount') => {
        switch (variant) {
            case 'earn':
                return 'var(--earn-stamp)';
            case 'spend':
                return 'var(--bakemaniaGold)';
            case 'delete':
                return '#ff4444';
            case 'earn-for-amount':
                return 'var(--earn-stamp)';
            default:
                return 'var(--text)';
        }
    };

    let pageTitle: ReactNode = "Operacje na karce";
    if (userToManage) {
        pageTitle = <><Icon iconName={IconName.QrCode} width={20} height={20} color='white' /> {userToManage.email}</>
    }
    return (
        <AsidePanel
            side='left'
            active={active}
        >
            <PanelViewTemplate
                title={pageTitle}
                appBar={(
                    <>
                        <FooterNav>
                            <IconButton
                                iconColor='white'
                                bgColor='var(--text)'
                                onClick={() => setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) })}
                                label='Wróć'
                                iconName={IconName.ArrowDown}
                            />
                        </FooterNav>
                    </>
                )}
            >
                <div className="ScanningSection">
                    {renderActionPanel()}
                </div>
            </PanelViewTemplate>
            {isUserLoading && (
                <div className="global-loader-wrapper">
                    <div className={`global-loader-spinner --active`} />
                </div>
            )}
            {!!updateOverlayConfig && (
                <UpdateOverlay
                    title={updateOverlayConfig.title}
                    message={updateOverlayConfig.message}
                    icon={(
                        updateOverlayConfig.operation === 'warning'
                            ? (
                                <Icon
                                    iconName={IconName.Warning}
                                    width={30}
                                    height={30}
                                    color={'var(--warning)'}
                                />
                            )
                            : <OperationIcon
                                operation={updateOverlayConfig.operation}
                            />
                    )}
                    onPrimaryAction={() => {
                        if (userToManage) {
                            setCustomerRoute(userToManage?._id, { delay: 250, beforeNavigate: () => setActive(false) });
                        } else {
                            setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) });
                        }
                    }}
                    onSecondaryAction={() => {
                        setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) });
                    }}
                    onWarningAction={updateOverlayConfig.operation === 'warning' ? () => {
                        setUpdateOverlayConfig(null);
                    } : undefined}
                />
            )}
        </AsidePanel>
    );
};

export default ScanningSection;

const stampsLabel = (amount: number): string => {
    if (amount === 1) {
        return 'pieczątkę';
    }

    if ([12, 13, 14].includes(amount)) {
        return 'pieczątek';
    }

    const toStr = `${amount}`;
    if (["2", "3", "4"].includes(toStr[toStr.length - 1])) {
        return 'pieczątki';
    }

    return 'pieczątek';
}

const cardsLabel = (amount: number): string => {
    if (amount === 1) {
        return 'karta';
    }

    if ([12, 13, 14].includes(amount)) {
        return 'kart';
    }

    const toStr = `${amount}`;
    if (["2", "3", "4"].includes(toStr[toStr.length - 1])) {
        return 'karty';
    }

    return 'kart';
}


const cardsLabelForWarning = (amount: number): string => {
    if (amount === 1) {
        return 'kartę';
    }

    if ([12, 13, 14].includes(amount)) {
        return 'kart';
    }

    const toStr = `${amount}`;
    if (["2", "3", "4"].includes(toStr[toStr.length - 1])) {
        return 'karty';
    }

    return 'kart';
}