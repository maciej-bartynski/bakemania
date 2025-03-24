import { FC } from "react"
import { StampsHistoryEntry } from "../../storage/me/me-types"
import './LastHistoryEntry.css';
import { AppConfig } from "../../storage/appConfig/appConfig-types";
import DiscountCard from "../DiscountCard/DiscountCard";
import Stamp from "../Stamp/Stamp";

const LastHistoryEntry: FC<{
    historyEntry: StampsHistoryEntry;
    appConfig: AppConfig;
}> = ({ historyEntry, appConfig }) => {

    if (historyEntry.by > 0) {
        const stampsBefore = historyEntry.balance - historyEntry.by;
        const cardsBefore = Math.floor(stampsBefore / appConfig.cardSize);
        const stampsAfter = historyEntry.balance;
        const cardsAfter = Math.floor(stampsAfter / appConfig.cardSize);

        if (cardsBefore < cardsAfter) {
            return (
                <>
                    <span>
                        Otrzymujesz rabat od bakeMAnii!
                    </span>
                    <DiscountCard
                        disabled={false}
                        additional={`(x ${cardsAfter - cardsBefore})`}
                    />
                </>
            )
        } else {
            return (
                <>
                    <span>
                        Otrzymujesz pieczątki (x {historyEntry.by})
                    </span>

                    {Array.from({ length: historyEntry.by }).map((_, index) => (
                        <Stamp key={index} />
                    ))}
                </>
            )
        }
    }

    if (historyEntry.by < 0) {
        return (
            <>
                <span>
                    Wydajesz pieczątki (x {historyEntry.by})
                </span>

                {Array.from({ length: historyEntry.by }).map((_, index) => (
                    <Stamp key={index} />
                ))}
            </>
        )
    }
}

export default LastHistoryEntry;