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
            title: string,
            message: string,
        } | null>(null);

        const setUpdateOverlayConfig = useCallback((param: {
            title: string,
            message: string,
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
                    message: `Dodałaś(eś) ${amount}x pieczątki do konta klienta`
                });

                returnHomeView();
            }
        }, [qrData, returnHomeView, setUpdateOverlayConfig, me]);

        const spentStamps = useCallback(async (amount: number): Promise<void> => {
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
                    title: 'Rabat przyznany!',
                    message: `Wymieniłaś(eś) ${amount}x pieczątki klienta na zniżkę`
                });

                returnHomeView();
            }
        }, [qrData, returnHomeView, setUpdateOverlayConfig, me]);

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
                    message: `Skasowałaś(eś) ${amount}x pieczątki klienta`
                });

                returnHomeView();
            }
        }, [qrData, returnHomeView, setUpdateOverlayConfig, me]);

        const renderActionPanel = () => {
            if (qrData && appConfig && userToManage) {
                if (qrData.variant === 'earn') {
                    return (
                        <Earn
                            cardId={qrData.cardId}
                            user={userToManage}
                            appConfig={appConfig}
                            earnStamps={earnStamps}
                            goHistoryView={goHistoryView}
                        />
                    );
                } else if (qrData.variant === 'spend') {
                    return (
                        <Spend
                            cardId={qrData.cardId}
                            user={userToManage}
                            appConfig={appConfig}
                            spendStamps={spentStamps}
                            goHistoryView={goHistoryView}
                        />
                    );
                } else if (qrData.variant === 'delete') {
                    return (
                        <Delete
                            cardId={qrData.cardId}
                            user={userToManage}
                            deleteStamps={deleteStamps}
                            appConfig={appConfig}
                            goHistoryView={goHistoryView}
                        />
                    );
                } else if (qrData.variant === 'earn-for-amount') {
                    return (
                        <EarnForAmount
                            cardId={qrData.cardId}
                            user={userToManage}
                            appConfig={appConfig}
                            earnStamps={earnStamps}
                            goHistoryView={goHistoryView}
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
                    <Icon iconName={IconName.StampForCash} color='var(--earn-stamp)' />Nabijanie za kwotę
                </>;
                break;
            default:
                pageTitle = 'Nieznana operacja';
                break;
        }

        return (
            <AsidePanel
                side='left'
                active={!!qrData}
            >
                <PanelViewTemplate
                    title={pageTitle}
                    appBarClassName={`ScanningSection__app-bar-${qrData?.variant}`}
                    appBar={(
                        <>
                            <FooterNav>
                                <IconButton
                                    iconColor='white'
                                    bgColor='var(--earn-stamp)'
                                    onClick={() => setVariant('earn')}
                                    label='Nabij'
                                    iconName={IconName.Stamp}
                                    textColor='var(--earn-stamp)'
                                />

                                <IconButton
                                    iconColor='white'
                                    bgColor='var(--earn-stamp)'
                                    onClick={() => setVariant('earn-for-amount')}
                                    label='Za kwotę'
                                    iconName={IconName.StampForCash}
                                    textColor='var(--earn-stamp)'
                                    variant='secondary'
                                />

                                <IconButton
                                    iconColor='white'
                                    bgColor='var(--bakemaniaGold)'
                                    onClick={() => setVariant('spend')}
                                    label='Rabat'
                                    iconName={IconName.Gift}
                                    textColor='var(--bakemaniaGold)'
                                />

                                <IconButton
                                    iconColor='white'
                                    bgColor='var(--remove-stamp)'
                                    onClick={() => setVariant('delete')}
                                    label='Skasuj'
                                    iconName={IconName.StampRemove}
                                    textColor='var(--remove-stamp)'
                                />

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
                    timeout={5000}
                    updated={!!updateOverlayConfig}
                />
            </AsidePanel>
        );
    };

export default ScanningSection;