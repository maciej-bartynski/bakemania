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

type ScannedData = {
    variant: 'spend' | 'earn' | 'delete' | 'earn-for-amount',
    cardId: string,
    userId: string,
}

const ScanningSection: FC<{
    qrData: ScannedData | null,
    setVariant: (newVariant: 'spend' | 'earn' | 'delete' | 'earn-for-amount') => void;
    returnHomeView: () => void;
    goHistoryView: (userId: string) => void;
}> = ({
    qrData,
    setVariant,
    returnHomeView,
    goHistoryView
}) => {
        const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
        const me = useMeSelector();

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

        const { appConfig } = useAppConfigSelector();
        const [, setUserLoading] = useState(false);
        const [userToManage, setUserToManage] = useState<OtherUser | null>(null);

        useEffect(() => {
            async function fetchUserToManage() {
                if (qrData?.userId) {
                    setUserLoading(true);
                    const userToManage = await apiService.fetch(`user/${qrData?.userId}`) as OtherUser;
                    if (userToManage) {
                        setUserToManage(userToManage);
                    }
                    setUserLoading(false);
                }
            }

            if (qrData?.userId) fetchUserToManage();
        }, [qrData]);

        const earnStamps = useCallback(async (amount: number): Promise<void> => {
            if (amount <= 0) {
                setUpdateOverlayConfig({
                    title: 'Ilość nie może być mniejsza od 1',
                    message: 'Wprowadź poprawną ilość',
                    variant: 'error',
                });
                return;
            };

            if (qrData && me.me) {

                if (qrData.cardId === 'change-force') {
                    await apiService.fetch('assistant/stamps/change-force', {
                        method: 'POST',
                        body: JSON.stringify({
                            amount,
                            userId: qrData?.userId,
                            assistantId: me.me._id
                        })
                    });
                } else {
                    await apiService.fetch('assistant/stamps/change', {
                        method: 'POST',
                        body: JSON.stringify({
                            amount,
                            userId: qrData?.userId,
                            cardHash: qrData?.cardId,
                            assistantId: me.me._id
                        })
                    });
                }

                setUpdateOverlayConfig({
                    title: 'Pieczątki nabite!',
                    message: <>Dodałaś(eś)  <br /><strong>{amount}</strong>x pieczątki<br /> do konta klienta</>,
                    variant: 'success'
                });

                returnHomeView();
            }
        }, [qrData, returnHomeView, setUpdateOverlayConfig, me]);

        const spentStamps = useCallback(async (amount: number): Promise<void> => {

            if (amount <= 0) {
                setUpdateOverlayConfig({
                    title: 'Ilość nie może być mniejsza od 1',
                    message: 'Wprowadź poprawną ilość',
                    variant: 'error',
                });
                return;
            }

            if (qrData && me.me) {
                if (qrData.cardId === 'change-force') {
                    await apiService.fetch('assistant/stamps/change-force', {
                        method: 'POST',
                        body: JSON.stringify({
                            amount: -amount,
                            userId: qrData?.userId,
                            assistantId: me.me._id
                        })
                    });
                } else {
                    await apiService.fetch('assistant/stamps/change', {
                        method: 'POST',
                        body: JSON.stringify({
                            amount: -amount,
                            userId: qrData?.userId,
                            cardHash: qrData?.cardId,
                            assistantId: me.me._id
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
                        returnHomeView();
                        return;
                    }
                }

                setUpdateOverlayConfig({
                    title: 'Odjęto pieczątki!',
                    message: <>Odjęłaś(eś)<br /><strong>{amount}</strong>x<br />pieczątki od salda klienta</>,
                    variant: 'success'
                });

                returnHomeView();
            }
        }, [qrData, appConfig, returnHomeView, setUpdateOverlayConfig, me]);

        const deleteStamps = useCallback(async (amount: number): Promise<void> => {
            if (qrData && me.me) {
                if (qrData.cardId === 'change-force') {
                    await apiService.fetch('assistant/stamps/change-force', {
                        method: 'POST',
                        body: JSON.stringify({
                            amount: -amount,
                            userId: qrData?.userId,
                            assistantId: me.me._id
                        })
                    });
                } else {
                    await apiService.fetch('assistant/stamps/change', {
                        method: 'POST',
                        body: JSON.stringify({
                            amount: -amount,
                            userId: qrData?.userId,
                            cardHash: qrData?.cardId,
                            assistantId: me.me._id
                        })
                    });
                }

                setUpdateOverlayConfig({
                    title: 'Pieczątki skasowane!',
                    message: <>Skasowałaś(eś)<br /><strong>{amount}</strong>x<br />pieczątki z konta klienta</>,
                    variant: 'success'
                });

                returnHomeView();
            }
        }, [qrData, returnHomeView, setUpdateOverlayConfig, me]);

        const renderTabs = () => {
            return (

                <div className="ScanningSection__tabs">
                    <TabButton
                        activeColor={"var(--earn-stamp)"}
                        iconName={IconName.Stamp}
                        label="Nabij"
                        onClick={() => setVariant('earn')}
                        selected={qrData?.variant === 'earn'}
                    />
                    <TabButton
                        activeColor={"var(--earn-stamp)"}
                        iconName={IconName.StampForCash}
                        label="Za kwotę"
                        onClick={() => setVariant('earn-for-amount')}
                        selected={qrData?.variant === 'earn-for-amount'}
                    />
                    <TabButton
                        activeColor={"var(--bakemaniaGold)"}
                        iconName={IconName.Gift}
                        label="Rabat"
                        onClick={() => setVariant('spend')}
                        selected={qrData?.variant === 'spend'}
                    />
                    <TabButton
                        activeColor={"var(--remove-stamp)"}
                        iconName={IconName.StampRemove}
                        label="Skasuj"
                        onClick={() => setVariant('delete')}
                        selected={qrData?.variant === 'delete'}
                    />
                    <div
                        className="ScanningSection__tabs-indicator"
                        style={{
                            backgroundColor: getTabColor(qrData?.variant ?? 'earn'),
                        }}
                    >
                        {pageTitle}
                    </div>
                </div>

            )
        }

        const renderActionPanel = () => {
            if (qrData && appConfig && userToManage) {
                if (qrData.variant === 'earn') {
                    return (
                        <Earn
                            user={userToManage}
                            appConfig={appConfig}
                            earnStamps={earnStamps}
                            goHistoryView={goHistoryView}
                            renderTabs={renderTabs}
                        />
                    );
                } else if (qrData.variant === 'spend') {
                    return (
                        <Spend
                            user={userToManage}
                            appConfig={appConfig}
                            spendStamps={spentStamps}
                            goHistoryView={goHistoryView}
                            renderTabs={renderTabs}
                        />
                    );
                } else if (qrData.variant === 'delete') {
                    return (
                        <Delete
                            user={userToManage}
                            deleteStamps={deleteStamps}
                            appConfig={appConfig}
                            goHistoryView={goHistoryView}
                            renderTabs={renderTabs}
                        />
                    );
                } else if (qrData.variant === 'earn-for-amount') {
                    return (
                        <EarnForAmount
                            user={userToManage}
                            appConfig={appConfig}
                            earnStamps={earnStamps}
                            goHistoryView={goHistoryView}
                            renderTabs={renderTabs}
                        />
                    );
                }
            }

            return 'Coś poszło nie tak...';
        };

        let pageTitle: ReactNode = '';

        switch (qrData?.variant) {
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
                active={!!qrData}
            >
                <PanelViewTemplate
                    title={'Operacje na karcie'}
                    appBar={(
                        <>
                            <FooterNav>
                                <IconButton
                                    iconColor='white'
                                    bgColor='var(--text)'
                                    onClick={returnHomeView}
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