import { FC, useCallback, useMemo } from "react";
import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import "./AssistantSection.css";
import Background from "../atoms/Background/Background";
import FooterNav from "../components/FooterNav/FooterNav";
import IconName from "../icons/IconName";
import ScanningSection from "../components/ScanningSection/ScanningSection";
import SettingsSection from "../components/SettingsSection/SettingsSection";
import UsersSection from "../components/UsersSection/UsersSection";
import Icon from "../icons/Icon";
import useAppDispatch from "../storage/useAppDispatch";
import appConfigActions from "../storage/appConfig/appConfig-actions";
import AssistanContext, { AssistantContextType, OpenedSection } from "./AssistantContext";
import { Me } from "../storage/me/me-types";

type ScannedData = {
    variant: 'spend' | 'earn',
    cardId: string,
}

const AssistantSection: FC<{
    assistant: Me
}> = ({
    assistant
}) => {


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

        const toggleCardDetailsView = useCallback((details?: {
            cardId: string,
            variant: 'spend' | 'earn'
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
                                variant: details.variant
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

        const setVariantCardDetailsView = useCallback((newVariant: 'earn' | 'spend') => {
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
        }, [toggleCardDetailsView]);

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
                            ]}
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
                        qrData={assistantContext.openedSection.details ?? null}
                        setVariant={setVariantCardDetailsView}
                        returnHomeView={toggleCardDetailsView}
                    />

                    <SettingsSection
                        active={assistantContext.openedSection.title === 'settings'}
                        toggleActive={toggleSettingsView}
                    />

                    <UsersSection
                        active={assistantContext.openedSection.title === 'card-list'}
                        toggleActive={toggleCardListView}
                        toggleCardDetailsView={toggleCardDetailsView}
                    />

                </Background>
            </AssistanContext.Provider>
        )
    }

export default AssistantSection