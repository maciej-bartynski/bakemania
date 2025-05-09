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
import FooterNav from "../../components/FooterNav/FooterNav";
import IconName from "../../icons/IconName";
import SettingsSection from "../../components/SettingsSection/SettingsSection";
import { useLiveUpdateContext } from "../../LiveUpdate/LiveUpdateContext";
import Background from "../../atoms/Background/Background";
import Stamp from "../../atoms/Stamp/Stamp";
import iterateIcons from "../../atoms/Stamp/Stamp.helper";
import LastHistoryEntry from "../../atoms/LastHistoryEntry/LastHistoryEntry";
import { Route, Routes } from "react-router";
import useAppNavigation from "../../tools/useAppNavigation";

const DashboardScreen: FC<{
    me: Me,
}> = ({
    me,
}) => {

        const [showStampQr, setShowStampQr] = useState(false);
        const [showGiftCardsSection, setShowGiftCardsSection] = useState(false);
        const { stampsUpdated, dismissStampsUpdated } = useLiveUpdateContext();
        const { setSettingsRoute } = useAppNavigation();

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
                            {
                                label: 'Nabij pieczątkę',
                                action: toggleStampQr,
                                icon: IconName.Stamp,
                            },
                            {
                                label: (me.stamps.amount > (appConfigState.appConfig?.cardSize ?? 7)) ? 'Zobacz nagrody' : 'Nagrody',
                                action: openGiftsSection,
                                icon: IconName.Gift,
                                variant: (me.stamps.amount > (appConfigState.appConfig?.cardSize ?? 7)) ? 'primary' : undefined
                            },
                        ]}
                    />
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

                    <div
                        onClick={dismissStampsUpdated}
                        style={{
                            position: 'fixed',
                            top: stampsUpdated ? '50%' : 0,
                            left: stampsUpdated ? '50%' : 0,
                            transform: stampsUpdated ? 'translate(-50%, -50%)' : 'translate(0%, 0%)',
                            background: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            maxWidth: '80vw',
                            maxHeight: '70vh',
                            borderRadius: 16,
                            boxShadow: stampsUpdated ? '0 0 10px 120px rgba(0, 0, 0, 0.5)' : undefined,
                            ...(stampsUpdated ? {
                                width: '100%',
                                height: '100%',
                                animation: 'ping-animation 5000ms linear',
                                right: 0,
                                bottom: 0,
                            } : {
                                width: 0,
                                height: 0,
                                animation: undefined,
                                right: undefined,
                                bottom: undefined,
                            }),

                        }}
                    >
                        {appConfigState.appConfig && me.stamps.history[me.stamps.history.length - 1] && (
                            <LastHistoryEntry
                                historyEntry={me.stamps.history[me.stamps.history.length - 1]}
                                appConfig={appConfigState.appConfig}
                            />
                        )}

                        <button
                            onClick={dismissStampsUpdated}
                            className="secondary"
                            style={{
                                marginTop: 16,
                                paddingLeft: 16,
                                paddingRight: 16,
                            }}
                        >
                            Rozumiem!
                        </button>
                        {!appConfigState.appConfig && (
                            <>
                                <span>
                                    <Stamp stampConfig={iterateIcons(3)[2]} />
                                </span>
                                <br />
                                <div>
                                    PING
                                </div>
                                <div>
                                    Coś fajnego!
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Background>
        )
    }

export default DashboardScreen;