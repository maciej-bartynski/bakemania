import { FC, useCallback, useMemo } from "react";
import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import "./AssistantSection.css";
import Background from "../../atoms/Background/Background";
import FooterNav, { NavAction } from "../../components/FooterNav/FooterNav";
import IconName from "../../icons/IconName";
import ScanningSection from "../../components/ScanningSection/ScanningSection";
import SettingsSection from "../../components/SettingsSection/SettingsSection";
import UsersSection from "../../components/UsersSection/UsersSection";
import Icon from "../../icons/Icon";
import useAppDispatch from "../../storage/useAppDispatch";
import appConfigActions from "../../storage/appConfig/appConfig-actions";
import AssistanContext, { AssistantContextType, OpenedSection } from "./AssistantContext";
import UserRole, { Me } from "../../storage/me/me-types";
import ManageSection from "../../components/ManageSection/ManageSection";
import UserHistorySection from "../../components/UserHistorySection.tsx/UserHistorySection";

type ScannedData = {
    variant: 'spend' | 'earn',
    userId: string,
    cardId: string,
}

const AssistantSection: FC<{
    assistant: Me
}> = ({
    assistant
}) => {
        const isAdmin = assistant.role === UserRole.Admin;
        const [isScanning, setIsScanning] = useState(false);
        const videoRef = useRef<HTMLVideoElement | null>(null);
        const scannerRef = useRef<QrScanner | null>(null);

        const [openedSection, setOpenedSection] = useState<OpenedSection>({ title: 'home' })

        const assistantContext: AssistantContextType = useMemo(() => {
            const currentAssistantContext: AssistantContextType = {
                assistantId: assistant._id,
                openedSection,
            };
            return currentAssistantContext;
        }, [assistant, openedSection]);

        const startScanning = () => {
            setIsScanning(true);
            scannerRef.current?.start();
        };

        const stopScanning = () => {
            setIsScanning(false);
            scannerRef.current?.stop();
        };

        const toggleSettingsView = useCallback(() => {
            stopScanning();
            setOpenedSection(state => ({ title: state.title === 'settings' ? 'home' : 'settings' }))
        }, []);

        const toggleManageView = useCallback(() => {
            stopScanning();
            setOpenedSection(state => ({ title: state.title === 'manage' ? 'home' : 'manage' }))
        }, []);

        const toggleCardDetailsView = useCallback((details?: {
            cardId: string,
            variant: 'spend' | 'earn',
            userId: string,
            assistantId: string,
        }) => {
            setOpenedSection(state => {
                if (state.title === 'card-details') {
                    return {
                        title: 'home'
                    }
                } else {
                    if (details) {
                        return {
                            title: 'card-details',
                            details: {
                                cardId: details.cardId,
                                variant: details.variant,
                                userId: details.userId,
                                assistantId: details.assistantId,
                            }
                        }
                    } else {
                        return {
                            title: 'home'
                        }
                    }
                }
            });
        }, []);

        const toggleHistoryView = useCallback((userId: string) => {
            setOpenedSection(state => {
                if (state.title === 'history') {
                    return {
                        title: 'home'
                    }
                } else {
                    return {
                        title: 'history',
                        details: {
                            userId: userId
                        }
                    }
                }
            });
        }, []);

        const setVariantCardDetailsView = useCallback((newVariant: 'earn' | 'spend' | 'delete' | 'earn-for-amount') => {
            setOpenedSection(state => {
                if (state.title === 'card-details') {
                    return {
                        title: 'card-details',
                        details: {
                            ...state.details,
                            variant: newVariant
                        }
                    }
                } else {
                    return state;
                }
            });
        }, [])

        const toggleCardListView = useCallback(() => {
            stopScanning();
            setOpenedSection(state => ({ title: state.title === 'card-list' ? 'home' : 'card-list' }))
        }, []);

        useEffect(() => {
            const videoEl = videoRef.current;
            if (videoEl) {
                scannerRef.current = new QrScanner(videoEl, (result) => {
                    scannerRef.current?.stop();
                    try {
                        const scannedData = JSON.parse(result.data) as ScannedData;
                        toggleCardDetailsView({
                            cardId: scannedData.cardId,
                            variant: scannedData.variant,
                            userId: scannedData.userId,
                            assistantId: assistant._id,
                        });
                        stopScanning();
                    } catch (e) {
                        console.warn(e);
                        stopScanning();
                        toggleCardDetailsView();
                    }
                    scannerRef.current?.stop();
                }, {
                    onDecodeError(err) {
                        console.warn(err);
                    },
                });
            }

            return () => {
                if (scannerRef.current) {
                    scannerRef.current.destroy();
                }
            }
        }, [toggleCardDetailsView, assistant]);

        const dispatch = useAppDispatch();

        useEffect(() => {
            dispatch(appConfigActions.getAppConfig());
        }, [dispatch]);

        return (
            <AssistanContext.Provider value={assistantContext}>
                <Background
                    appBar={
                        <FooterNav
                            actions={[
                                {
                                    label: 'Ustawienia',
                                    action: toggleSettingsView,
                                    icon: IconName.Cog,
                                },
                                isAdmin ? {
                                    label: 'Zarządzaj',
                                    action: toggleManageView,
                                    icon: IconName.Cog,
                                } : null,
                                {
                                    label: isScanning ? "Zatrzymaj" : "Skanuj",
                                    action: isScanning ? stopScanning : startScanning,
                                    icon: IconName.QrCode,
                                    variant: 'primary'
                                },
                                {
                                    label: 'Użytkownicy',
                                    action: toggleCardListView,
                                    icon: IconName.Users,
                                },
                            ].filter((item) => !!item) as NavAction[]}
                        />

                    }
                >
                    <div className="assistantSection__scanner-section">
                        <div
                            style={{
                                width: '200px',
                                height: '200px',
                                background: isScanning ? 'var(--bakemaniaGold)' : 'black',
                                borderRadius: 6,
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <video
                                ref={videoRef}
                                style={{
                                    width: '200px',
                                    height: '200px',
                                }}
                            />
                            <div
                                style={{
                                    width: 24,
                                    height: 24,
                                    position: 'absolute',
                                    top: 'calc(50% - 12px)',
                                    left: 'calc(50% - 12px)',
                                }}
                            >
                                <Icon iconName={IconName.QrCode} color="white" />
                            </div>
                        </div>

                        <button onClick={isScanning ? stopScanning : startScanning}>
                            {isScanning ? "Zatrzymaj" : "Skanuj"}
                        </button>
                    </div>

                    <ScanningSection
                        qrData={assistantContext.openedSection.title === 'card-details' ? assistantContext.openedSection.details : null}
                        setVariant={setVariantCardDetailsView}
                        returnHomeView={toggleCardDetailsView}
                        goHistoryView={toggleHistoryView}
                    />

                    <SettingsSection
                        active={assistantContext.openedSection.title === 'settings'}
                        toggleActive={toggleSettingsView}
                        toggleCardDetailsView={toggleCardDetailsView}
                        toggleHistoryView={toggleHistoryView}
                    />

                    {isAdmin && (
                        <ManageSection
                            active={assistantContext.openedSection.title === 'manage'}
                            toggleActive={toggleManageView}
                        />
                    )}

                    <UsersSection
                        active={assistantContext.openedSection.title === 'card-list'}
                        toggleActive={toggleCardListView}
                        goHistoryView={toggleHistoryView}
                        toggleCardDetailsView={async (details) => {
                            if (details) {
                                toggleCardDetailsView({
                                    userId: details.userId,
                                    variant: details.variant,
                                    assistantId: assistant._id,
                                    cardId: 'change-force',
                                })
                            }
                        }}
                    />


                    <UserHistorySection
                        active={assistantContext.openedSection.title === 'history'}
                        details={assistantContext.openedSection.title === 'history' ? assistantContext.openedSection.details : null}
                        toggleActive={() => toggleHistoryView(assistantContext.openedSection.details?.userId ?? '')}
                        toggleCardDetailsView={async (details) => {
                            if (details) {
                                toggleCardDetailsView({
                                    userId: details.userId,
                                    variant: details.variant,
                                    assistantId: assistant._id,
                                    cardId: 'change-force',
                                })
                            }
                        }}
                    />

                </Background>
            </AssistanContext.Provider>
        )
    }

export default AssistantSection