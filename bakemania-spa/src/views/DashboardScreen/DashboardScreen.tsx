import { FC, useCallback, useEffect, useState } from "react";
import { Me } from "../../storage/me/me-types";
import './DashboardScreen.css';
import StampsCard from "../../atoms/StampsCard/StampsCard";
import QrBottomPanel from "../../atoms/QrBottomPanel/QrBottomPanel";
import DiscountSection from "../../components/DiscountSection/DiscountSection";
import useAppDispatch from "../../storage/useAppDispatch";
import appConfigActions from "../../storage/appConfig/appConfig-actions";
import useAppConfigSelector from "../../storage/appConfig/appConfig-selectors";
import ReducerState from "../../storage/types";
import FooterNav, { NavAction } from "../../components/FooterNav/FooterNav";
import IconName from "../../icons/IconName";
import SettingsSection from "../../components/SettingsSection/SettingsSection";
import { useLiveUpdateContext } from "../../LiveUpdate/LiveUpdateContext";
import Background from "../../atoms/Background/Background";
import { Route, Routes } from "react-router";
import useAppNavigation from "../../tools/useAppNavigation";
import CustomerLiveUpdate from "../../atoms/CustomerLiveUpdate/CustomerLiveUpdate";
import AddToHomeScreen from "../../atoms/AddToHomeScreen/AddToHomeScreen";
import BottomPanel from "../../atoms/BottomPanel/BottomPanel";
import { isStandalone } from "../../tools/isPwa";

const DashboardScreen: FC<{
    me: Me,
}> = ({
    me,
}) => {

        const [showStampQr, setShowStampQr] = useState(false);
        const [showGiftCardsSection, setShowGiftCardsSection] = useState(false);
        const { stampsUpdated } = useLiveUpdateContext();
        const { setSettingsRoute } = useAppNavigation();
        const [showAppDownloadSection, setShowAppDownloadSection] = useState(false);

        useEffect(() => {
            if (!stampsUpdated) {
                setShowStampQr(false);
            }
        }, [stampsUpdated])

        const dispatch = useAppDispatch();
        const appConfigState = useAppConfigSelector();

        const toggleStampQr = useCallback(() => {
            setShowStampQr(state => !state);
        }, [])

        const openGiftsSection = useCallback(() => {
            setShowStampQr(false);
            setShowGiftCardsSection(true);
        }, []);

        const closeGiftsSection = useCallback(() => {
            setShowStampQr(false);
            setShowGiftCardsSection(false);
        }, []);

        useEffect(() => {
            dispatch(appConfigActions.getAppConfig());
        }, [dispatch]);

        const cardSize = appConfigState?.appConfig?.cardSize ?? 7;

        let callToAction = <>Zbierz jeszcze <span>{cardSize - (me.stamps.amount % cardSize)}</span> pieczątki</>;

        if (me.stamps.amount % cardSize === 0) {
            callToAction = <>Twoja karta jest gotowa!</>;
        }

        const currentGiftsAmount = Math.floor(me.stamps.amount / cardSize);
        return (
            <Background
                appBar={
                    <FooterNav
                        actions={[
                            {
                                label: 'Ustawienia',
                                action: setSettingsRoute,
                                icon: IconName.Cog,
                            },
                            !isStandalone() ? {
                                label: 'Aplikacja',
                                action: () => setShowAppDownloadSection(true),
                                icon: IconName.MobileDownload,
                            } : false,
                            {
                                label: 'Nabij pieczątkę',
                                action: toggleStampQr,
                                icon: IconName.Stamp,
                            },
                            {
                                label: (me.stamps.amount > (appConfigState.appConfig?.cardSize ?? 7)) ? 'Zobacz nagrody' : 'Nagrody',
                                action: openGiftsSection,
                                icon: IconName.Gift,
                                variant: (me.stamps.amount > (appConfigState.appConfig?.cardSize ?? 7)) ? 'primary' : undefined,
                                badge: currentGiftsAmount > 0 ? currentGiftsAmount : undefined
                            },
                        ].filter(Boolean) as NavAction[]}
                    />
                }
                panels={
                    <>
                        <QrBottomPanel
                            userId={me._id}
                            show={showStampQr}
                            toggleBottomPanel={toggleStampQr}
                        />

                        <DiscountSection
                            active={showGiftCardsSection}
                            toggleActive={closeGiftsSection}
                        />

                        <Routes>
                            <Route
                                path="/settings"
                                element={
                                    <SettingsSection />
                                }
                            />
                        </Routes>

                        {(!appConfigState.appConfig || appConfigState.status === ReducerState.Pristine || appConfigState.status === ReducerState.Fetching) && (
                            <div className="splashScreen__loader-wrapper">
                                <div className={`global-loader-spinner --active`} />
                            </div>
                        )}
                        <CustomerLiveUpdate
                            openGiftsSection={openGiftsSection}
                        />
                    </>
                }
            >
                <div className="dashboardScreen">
                    <section className="dashboardScreen__stamps-section">
                        <div
                            className={`dashboardScreen__clickable`}
                            role="button"
                            onClick={toggleStampQr}
                        >
                            <StampsCard
                                stampsAmount={me.stamps.amount}
                                stampsInRow={appConfigState.appConfig?.stampsInRow ?? 4}
                                stampsInCard={cardSize}
                                discount={appConfigState.appConfig?.discount ?? 15}
                            />
                        </div>
                        <p className="dashboardScreen__message">{callToAction}<br />{me.email}</p>

                    </section>
                </div>
                {!isStandalone() && (
                    <BottomPanel
                        show={showAppDownloadSection}
                        toggleBottomPanel={() => setShowAppDownloadSection(state => !state)}
                        title="Zainstaluj aplikację na ekranie głównym"
                    >
                        <AddToHomeScreen />
                    </BottomPanel>
                )}
            </Background>
        )
    }

export default DashboardScreen;