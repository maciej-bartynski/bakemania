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

const DashboardScreen: FC<{
    me: Me,
    logOut: () => Promise<void>
}> = ({
    me,
}) => {

        const [showStampQr, setShowStampQr] = useState(false);
        const [showGiftCardsSection, setShowGiftCardsSection] = useState(false);
        const [showSettingsSection, setShowSettingsSection] = useState(false);
        const { stampsUpdated, dismissStampsUpdated } = useLiveUpdateContext();

        useEffect(() => {
            if (!stampsUpdated) {
                setShowStampQr(false);
            }
        }, [stampsUpdated])

        const dispatch = useAppDispatch();
        const appConfigState = useAppConfigSelector();

        const toggleStampQr = useCallback(() => {
            setShowSettingsSection(false);
            setShowStampQr(state => !state);
        }, [])

        const openGiftsSection = useCallback(() => {
            setShowStampQr(false);
            setShowSettingsSection(false);
            setShowGiftCardsSection(true);
        }, []);

        const closeGiftsSection = useCallback(() => {
            setShowStampQr(false);
            setShowGiftCardsSection(false);
            setShowSettingsSection(false);
        }, []);

        const openSettingsSection = useCallback(() => {
            setShowStampQr(false);
            setShowGiftCardsSection(false);
            setShowSettingsSection(true);
        }, []);

        const closeSettingsSection = useCallback(() => {
            setShowStampQr(false);
            setShowGiftCardsSection(false);
            setShowSettingsSection(false);
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
                                action: openSettingsSection,
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

                    <SettingsSection
                        active={showSettingsSection}
                        toggleActive={closeSettingsSection}
                    />

                    {(!appConfigState.appConfig || appConfigState.status === ReducerState.Pristine || appConfigState.status === ReducerState.Fetching) && (
                        <div className="splashScreen__loader-wrapper">
                            <div className={`global-loader-spinner --active`} />
                        </div>
                    )}

                    <div
                        onClick={dismissStampsUpdated}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            background: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',

                            ...(stampsUpdated ? {
                                width: undefined,
                                height: undefined,
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

                        {!appConfigState.appConfig && (
                            <>
                                <span>
                                    <Stamp stampConfig={iterateIcons(1)[0]} />
                                    <Stamp stampConfig={iterateIcons(7)[3]} />
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