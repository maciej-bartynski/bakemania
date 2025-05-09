import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
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
import Icon from '../../icons/Icon';
import TabButton from '../../atoms/TabButton/TabButton';
import { useParams } from 'react-router';
import useAppNavigation from '../../tools/useAppNavigation';

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

    const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);


    const cardId = params.cardId ?? 'card-id-placeholder';
    const userId = params.userId ?? 'user-id-placeholder';
    const operation = params.operation as 'spend' | 'earn' | 'delete' | 'earn-for-amount';
    const assistantId = me.me?._id;

    const setVariant = useCallback((newVariant: 'spend' | 'earn' | 'delete' | 'earn-for-amount') => {
        setScanningRoute({
            cardId,
            userId,
            operation: newVariant
        })
    }, [setScanningRoute, cardId, userId]);

    useEffect(() => {
        return () => {
            if (overlayTimerRef.current) {
                clearTimeout(overlayTimerRef.current);
            }
        }
    }, []);

    const [updateOverlayConfig, _setUpdateOverlayConfig] = useState<{
        title: ReactNode,
        message: ReactNode,
        variant: 'success' | 'error'
    } | null>(null);

    const setUpdateOverlayConfig = useCallback((param: {
        title: ReactNode,
        message: ReactNode,
        variant: 'success' | 'error'
    }) => {
        _setUpdateOverlayConfig(param);
        overlayTimerRef.current = setTimeout(() => {
            _setUpdateOverlayConfig(null)
        }, 3000);
    }, []);

    const [, setUserLoading] = useState(false);
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
                title: 'Ilość nie może być mniejsza od 1',
                message: 'Wprowadź poprawną ilość',
                variant: 'error',
            });
            return;
        };

        if (cardId === 'change-force') {
            await apiService.fetch('assistant/stamps/change-force', {
                method: 'POST',
                body: JSON.stringify({
                    amount,
                    userId: userId,
                    assistantId
                })
            });
        } else {
            await apiService.fetch('assistant/stamps/change', {
                method: 'POST',
                body: JSON.stringify({
                    amount,
                    userId,
                    cardHash: cardId,
                    assistantId
                })
            });
        }

        setUpdateOverlayConfig({
            title: 'Pieczątki nabite!',
            message: <>Dodałaś(eś)  <br /><strong>{amount}</strong>x pieczątki<br /> do konta klienta</>,
            variant: 'success'
        });

        setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) });


    }, [setUpdateOverlayConfig, cardId, userId, assistantId, setHomeRoute]);

    const spentStamps = useCallback(async (amount: number): Promise<void> => {

        if (amount <= 0) {
            setUpdateOverlayConfig({
                title: 'Ilość nie może być mniejsza od 1',
                message: 'Wprowadź poprawną ilość',
                variant: 'error',
            });
            return;
        }
        if (cardId === 'change-force') {
            await apiService.fetch('assistant/stamps/change-force', {
                method: 'POST',
                body: JSON.stringify({
                    amount: -amount,
                    userId,
                    assistantId
                })
            });
        } else {
            await apiService.fetch('assistant/stamps/change', {
                method: 'POST',
                body: JSON.stringify({
                    amount: -amount,
                    userId,
                    cardHash: cardId,
                    assistantId
                })
            });
        }
        if (appConfig?.cardSize) {
            if (amount % appConfig?.cardSize === 0) {
                setUpdateOverlayConfig({
                    title: 'Rabat przyznany!',
                    message: <>Wymieniłaś(eś)<br /><strong>{amount}</strong>x<br />pieczątki klienta na zniżkę</>,
                    variant: 'success'
                });
                setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) });
                return;
            }
        }
        setUpdateOverlayConfig({
            title: 'Odjęto pieczątki!',
            message: <>Odjęłaś(eś)<br /><strong>{amount}</strong>x<br />pieczątki od salda klienta</>,
            variant: 'success'
        });

        setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) });

    }, [
        appConfig,
        setHomeRoute,
        setUpdateOverlayConfig,
        cardId,
        userId,
        assistantId
    ]);

    const deleteStamps = useCallback(async (amount: number): Promise<void> => {

        if (cardId === 'change-force') {
            await apiService.fetch('assistant/stamps/change-force', {
                method: 'POST',
                body: JSON.stringify({
                    amount: -amount,
                    userId,
                    assistantId
                })
            });
        } else {
            await apiService.fetch('assistant/stamps/change', {
                method: 'POST',
                body: JSON.stringify({
                    amount: -amount,
                    userId,
                    cardHash: cardId,
                    assistantId
                })
            });
        }

        setUpdateOverlayConfig({
            title: 'Pieczątki skasowane!',
            message: <>Skasowałaś(eś)<br /><strong>{amount}</strong>x<br />pieczątki z konta klienta</>,
            variant: 'success'
        });

        setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) });

    }, [setHomeRoute, setUpdateOverlayConfig, cardId, userId, assistantId]);

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
                    className="ScanningSection__tabs-indicator"
                    style={{
                        backgroundColor: getTabColor(operation ?? 'earn'),
                    }}
                >
                    {pageTitle}
                </div>
            </div>

        )
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

    let pageTitle: ReactNode = '';

    switch (operation) {
        case 'spend':
            pageTitle = <>
                <Icon iconName={IconName.Gift} color='white' />Odbieranie rabatu</>;
            break;
        case 'earn':
            pageTitle = <>
                <Icon iconName={IconName.Stamp} color='white' />Nabijanie pieczątek
            </>;
            break;
        case 'delete':
            pageTitle = <>
                <Icon iconName={IconName.StampRemove} color='white' />Kasowanie pieczątek
            </>;
            break;
        case 'earn-for-amount':
            pageTitle = <>
                <Icon iconName={IconName.StampForCash} color='white' />Nabijanie za kwotę
            </>;
            break;
        default:
            pageTitle = 'Nieznana operacja';
            break;
    }

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

    return (
        <AsidePanel
            side='left'
            active={active}
        >
            <PanelViewTemplate
                title={'Operacje na karcie'}
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
            <UpdateOverlay
                title={updateOverlayConfig?.title ?? "-"}
                message={updateOverlayConfig?.message ?? "-"}
                variant={updateOverlayConfig?.variant ?? 'success'}
                timeout={5000}
                updated={!!updateOverlayConfig}
                onClose={() => {
                    _setUpdateOverlayConfig(null)
                    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
                }}
            />
        </AsidePanel>
    );
};

export default ScanningSection;