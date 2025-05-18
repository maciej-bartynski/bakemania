import { FC } from "react";
import { useLiveUpdateContext } from "../../LiveUpdate/LiveUpdateContext";
import LastHistoryEntry from "../LastHistoryEntry/LastHistoryEntry";
import useAppConfigSelector from "../../storage/appConfig/appConfig-selectors";
import useMeSelector from "../../storage/me/me-selectors";
import "./CustomerLiveUpdate.css";
import DateHelpers from "../../tools/formatCreatedAt";
import { StampsHistoryEntry } from "../../storage/me/me-types";

const { findLastHistoryEntry } = DateHelpers;

const CustomerLiveUpdate: FC<{
    openGiftsSection: () => void;
}> = ({
    openGiftsSection
}) => {

        const { stampsUpdated, dismissStampsUpdated } = useLiveUpdateContext();
        const appConfigState = useAppConfigSelector();
        const { me } = useMeSelector();

        if (!me || !appConfigState.appConfig) return null;

        const lastHistoryEntry = findLastHistoryEntry<StampsHistoryEntry>(me.stamps.history);

        if (!lastHistoryEntry) {
            return (
                <div
                    onClick={dismissStampsUpdated}
                    className={`CustomerLiveUpdate__wrapper ${stampsUpdated ? 'CustomerLiveUpdate__wrapper--expanded' : ''}`}
                >
                    <div className="CustomerLiveUpdate__content">
                        Coś poszło nie tak
                    </div>

                    <button
                        onClick={() => {
                            dismissStampsUpdated();
                        }}
                        className={'secondary CustomerLiveUpdate__button'}
                    >
                        Zamknij
                    </button>
                </div>
            )
        }

        const stampsBefore = lastHistoryEntry.balance - lastHistoryEntry.by;
        const cardsBefore = Math.floor(stampsBefore / appConfigState.appConfig.cardSize);
        const cardsAfter = Math.floor(lastHistoryEntry.balance / appConfigState.appConfig.cardSize);

        if (lastHistoryEntry.by > 0) {
            const newGiftAdded = cardsBefore < cardsAfter;

            return (
                <div
                    onClick={dismissStampsUpdated}
                    className={`CustomerLiveUpdate__wrapper ${stampsUpdated ? 'CustomerLiveUpdate__wrapper--expanded' : ''}`}
                >
                    <div className="CustomerLiveUpdate__content">
                        <LastHistoryEntry
                            historyEntry={lastHistoryEntry}
                            appConfig={appConfigState.appConfig}
                        />
                    </div>

                    <button
                        onClick={() => {
                            dismissStampsUpdated();
                            if (newGiftAdded) {
                                openGiftsSection();
                            }
                        }}
                        className={`${newGiftAdded ? '' : 'secondary'} CustomerLiveUpdate__button`}
                        style={{
                            backgroundColor: newGiftAdded ? 'var(--bakemaniaGold)' : undefined,
                            border: newGiftAdded ? 'none' : undefined,
                        }}
                    >
                        {newGiftAdded ? 'Zobacz swoje nagrody' : 'Rozumiem!'}
                    </button>
                </div>
            )
        }

        if (lastHistoryEntry.by < 0) {
            return (
                <div
                    onClick={dismissStampsUpdated}
                    className={`CustomerLiveUpdate__wrapper ${stampsUpdated ? 'CustomerLiveUpdate__wrapper--expanded' : ''}`}
                >
                    <div className="CustomerLiveUpdate__content">
                        <LastHistoryEntry
                            historyEntry={lastHistoryEntry}
                            appConfig={appConfigState.appConfig}
                        />
                    </div>

                    <button
                        onClick={dismissStampsUpdated}
                        className="secondary CustomerLiveUpdate__button"
                    >
                        Rozumiem!
                    </button>
                </div>
            )
        }

        return (
            <div
                onClick={dismissStampsUpdated}
                className={`CustomerLiveUpdate__wrapper ${stampsUpdated ? 'CustomerLiveUpdate__wrapper--expanded' : ''}`}
            >
                <div className="CustomerLiveUpdate__content">
                    {appConfigState.appConfig && me.stamps.history[me.stamps.history.length - 1] && (
                        <LastHistoryEntry
                            historyEntry={me.stamps.history[me.stamps.history.length - 1]}
                            appConfig={appConfigState.appConfig}
                        />
                    )}
                </div>

                <button
                    onClick={dismissStampsUpdated}
                    className="secondary CustomerLiveUpdate__button"
                >
                    Rozumiem!
                </button>

            </div>
        )
    };

export default CustomerLiveUpdate;