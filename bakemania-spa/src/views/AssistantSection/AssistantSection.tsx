import { FC } from "react";
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
import UserRole, { Me } from "../../storage/me/me-types";
import ManageSection from "../../components/ManageSection/ManageSection";
import UserHistorySection from "../../components/UserHistorySection.tsx/UserHistorySection";
import { Route, Routes } from "react-router";
import useAppNavigation from "../../tools/useAppNavigation";
import UserIcon from "../../icons/UserIcon";

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
        const { setScanningRoute, setSettingsRoute, setUsersRoute, setManageRoute } = useAppNavigation();

        const startScanning = () => {
            setIsScanning(true);
            scannerRef.current?.start();
        };

        const stopScanning = () => {
            setIsScanning(false);
            scannerRef.current?.stop();
        };

        useEffect(() => {
            const videoEl = videoRef.current;
            if (videoEl) {
                scannerRef.current = new QrScanner(videoEl, (result) => {
                    scannerRef.current?.stop();
                    try {
                        const scannedData = JSON.parse(result.data) as ScannedData;
                        setScanningRoute({
                            cardId: scannedData.cardId,
                            userId: scannedData.userId,
                            operation: scannedData.variant,
                        });
                        stopScanning();
                    } catch (e) {
                        console.warn(e);
                        stopScanning();
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
        }, [assistant, setScanningRoute]);

        const dispatch = useAppDispatch();

        useEffect(() => {
            dispatch(appConfigActions.getAppConfig());
        }, [dispatch]);

        return (

            <Background
                appBar={
                    <FooterNav
                        actions={[
                            {
                                label: 'Ustawienia',
                                action: () => setSettingsRoute({ delay: 0, beforeNavigate: stopScanning }),
                                icon: IconName.Cog,
                            },
                            isAdmin ? {
                                label: 'Zarządzaj',
                                action: () => setManageRoute({ delay: 0, beforeNavigate: stopScanning }),
                                icon: <UserIcon.Admin color="white" />,
                            } : null,
                            {
                                label: isScanning ? "Zatrzymaj" : "Skanuj",
                                action: isScanning ? stopScanning : startScanning,
                                icon: IconName.QrCode,
                                variant: 'primary'
                            },
                            {
                                label: 'Użytkownicy',
                                action: () => setUsersRoute({ delay: 0, beforeNavigate: stopScanning }),
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


                <Routes>
                    <Route
                        path="/scan/:userId/:cardId/:operation"
                        element={
                            <ScanningSection />
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <SettingsSection />
                        }
                    />
                    <Route
                        path="/manage"
                        element={isAdmin ? (
                            <ManageSection />
                        ) : <>Nie jesteś administratorem</>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <UsersSection />
                        }
                    />

                    <Route
                        path="/user/:userId"
                        element={
                            <UserHistorySection />
                        }
                    />
                </Routes>

            </Background>

        )
    }

export default AssistantSection