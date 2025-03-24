import { FC, useCallback, useEffect, useRef, useState } from 'react';
import './ScanningSection.css';
import FooterNav from '../FooterNav/FooterNav';
import IconName from '../../icons/IconName';
import AsidePanel from '../../atoms/AsidePanel/AsidePanel';
import PanelViewTemplate from '../../atoms/PanelViewTemplate/PanelViewTemplate';
import apiService from '../../services/ApiService';
import useAppConfigSelector from '../../storage/appConfig/appConfig-selectors';
import RichNumberForm from '../RichNumberForm/RichNumberForm';
import { OtherUser } from '../../storage/users/users-types';
import UserShort from '../../atoms/UserShort/UserShort';
import UpdateOverlay from '../../atoms/UpdateOverlay/UpdateOverlay';
import useMeSelector from '../../storage/me/me-selectors';

type ScannedData = {
    variant: 'spend' | 'earn',
    cardId: string,
    userId: string,
}

const ScanningSection: FC<{
    qrData: ScannedData | null,
    setVariant: (newVariant: 'spend' | 'earn') => void;
    returnHomeView: () => void;
}> = ({
    qrData,
    setVariant,
    returnHomeView
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
                    const userToManage = await apiService.fetch(`admin/users/get-user/${qrData?.userId}`) as OtherUser;
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
                    await apiService.fetch('admin/stamps/change-force', {
                        method: 'POST',
                        body: JSON.stringify({
                            amount,
                            userId: qrData?.userId,
                            assistantId: me.me._id
                        })
                    });
                } else {
                    await apiService.fetch('admin/stamps/change', {
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
                    await apiService.fetch('admin/stamps/change-force', {
                        method: 'POST',
                        body: JSON.stringify({
                            amount: -amount,
                            userId: qrData?.userId,
                            assistantId: me.me._id
                        })
                    });
                } else {

                    await apiService.fetch('admin/stamps/change', {
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

        const renderActionPanel = () => {
            if (qrData && appConfig) {

                const userGiftsAmount = Math.floor((userToManage?.stamps.amount ?? 0) / appConfig.cardSize);

                if (qrData.variant === 'earn') {
                    return (
                        <div className='ScanningSection'>
                            <UserShort
                                userId={qrData.cardId}
                                userEmail={userToManage?.email}
                                userStampsAmount={userToManage?.stamps.amount}
                                userGiftsAmount={userGiftsAmount}
                            />
                            <RichNumberForm
                                key='stamps'
                                inputLabel="Ile pieczątek nabić?"
                                buttonLabel={(submitValue: number) => `Nabij ${submitValue}`}
                                descriptionLabel={(submitValue: number) => (
                                    <span>
                                        Kwota zakupów:<br />
                                        - od <strong>{submitValue * appConfig.cardSize}.00 PLN</strong><br />
                                        - do <strong>{((submitValue + 1) * appConfig.cardSize) - 0.01} PLN</strong>
                                    </span>
                                )}
                                onSubmit={earnStamps}
                                minValue={1}
                                maxValue={100}
                            />
                        </div>
                    );
                } else if (qrData.variant === 'spend') {
                    return (
                        <div className='ScanningSection'>
                            <UserShort
                                userId={qrData.cardId}
                                userEmail={userToManage?.email}
                                userStampsAmount={userToManage?.stamps.amount}
                                userGiftsAmount={Math.floor((userToManage?.stamps.amount ?? 0) / appConfig.cardSize)}
                            />
                            <RichNumberForm
                                key='gifts'
                                inputLabel="Ile kart rabatowych użyć?"
                                buttonLabel={(submitValue: number) => `Przyznaj rabat ${submitValue * appConfig.discount}.00 PLN (${submitValue} karty)`}
                                descriptionLabel={(submitValue: number) => (
                                    <span>
                                        Przyznajesz rabat:<br />
                                        - <strong>{submitValue * appConfig.discount}.00 PLN</strong><br />
                                        - <strong>{submitValue} karty</strong>
                                    </span>
                                )}
                                onSubmit={(submitValue: number) => spentStamps(submitValue * appConfig.cardSize)}
                                minValue={userGiftsAmount >= 1 ? 1 : 0}
                                maxValue={userGiftsAmount >= 1 ? userGiftsAmount : 0}
                            />
                        </div>
                    );
                }
            }

            return 'Coś poszło nie tak...';
        };

        return (
            <AsidePanel
                side='left'
                active={!!qrData}
            >
                <PanelViewTemplate
                    title={qrData?.variant === 'spend' ? 'Odbieranie rabatu' : 'Nabijanie pieczątek'}
                    appBar={(
                        <>
                            <FooterNav
                                actions={[
                                    qrData?.variant === 'earn' ? {
                                        label: 'Rabaty klienta',
                                        action: () => setVariant('spend'),
                                        icon: IconName.Gift,
                                    } : {
                                        label: 'Nabij pieczątki',
                                        action: () => setVariant('earn'),
                                        icon: IconName.Stamp,
                                    },
                                    {
                                        label: 'Wróć',
                                        action: () => returnHomeView(),
                                        icon: IconName.ArrowDown,
                                    },
                                ]}
                            />
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