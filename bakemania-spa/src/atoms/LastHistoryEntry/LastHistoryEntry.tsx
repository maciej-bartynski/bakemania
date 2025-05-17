import { FC, ReactNode } from "react"
import { StampsHistoryEntry } from "../../storage/me/me-types"
import './LastHistoryEntry.css';
import { AppConfig } from "../../storage/appConfig/appConfig-types";
import Stamp from "../Stamp/Stamp";
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";
import iterateIcons from "../Stamp/Stamp.helper";

const LastHistoryEntry: FC<{
    historyEntry: StampsHistoryEntry;
    appConfig: AppConfig;
}> = ({ historyEntry, appConfig }) => {

    if (historyEntry.by > 0) {
        const stampsBefore = historyEntry.balance - historyEntry.by;
        const cardsBefore = Math.floor(stampsBefore / appConfig.cardSize);
        const cardsAfter = Math.floor(historyEntry.balance / appConfig.cardSize);
        const newGift = cardsBefore < cardsAfter;

        if (newGift) {
            const newGiftAmount = cardsAfter - cardsBefore;
            const stampsRest = historyEntry.balance - (Math.floor(historyEntry.balance / appConfig.cardSize) * appConfig.cardSize);
            const stampsToDisplay: ReactNode[] = [];
            if (stampsRest > 0) {
                const iconsConfig = iterateIcons(stampsRest > 50 ? 50 : stampsRest);
                for (let i = 0; i < iconsConfig.length; i++) {
                    stampsToDisplay.push(
                        <Stamp
                            key={i}
                            stampConfig={iconsConfig[i]}
                        />
                    )
                }
            }
            return (
                <div className="LastHistoryEntry">
                    <div className="LastHistoryEntry__icon --gift">
                        <Icon
                            iconName={IconName.Gift}
                            color="white"
                            width={20}
                            height={20}
                        />
                    </div>
                    <span className="LastHistoryEntry__title-operation --gift">
                        Otrzymujesz
                    </span>
                    <span className="LastHistoryEntry__title-amount --gift">
                        <strong>
                            {newGiftAmount}
                        </strong>
                        {giftsLabelForUserUpdate(historyEntry.by)}
                    </span>
                    <span className="LastHistoryEntry__title-operation">
                        i zaczynasz nową kartę na pieczątki
                    </span>
                    <div
                        className="LastHistoryEntry__stamps"
                    >
                        {stampsToDisplay}
                    </div>
                </div>
            )
        }

        if (!newGift) {
            const stampsToDisplay: ReactNode[] = [];
            const iconsConfig = iterateIcons(historyEntry.by > 50 ? 50 : historyEntry.by);
            for (let i = 0; i < iconsConfig.length; i++) {
                stampsToDisplay.push(
                    <Stamp
                        key={i}
                        stampConfig={iconsConfig[i]}
                    />
                )
            }

            return (
                <div className="LastHistoryEntry">
                    <div className="LastHistoryEntry__icon">
                        <Icon
                            iconName={IconName.Stamp}
                            color="white"
                            width={20}
                            height={20}
                        />
                    </div>
                    <span className="LastHistoryEntry__title-operation">
                        Otrzymujesz
                    </span>
                    <span className="LastHistoryEntry__title-amount">
                        <strong>
                            {historyEntry.by}
                        </strong>
                        {stampsLabelForUserUpdate(historyEntry.by)}
                    </span>
                    <div
                        className="LastHistoryEntry__stamps"
                    >
                        {stampsToDisplay}
                    </div>
                </div>
            )
        }
    }

    if (historyEntry.by < 0) {
        if (+(historyEntry.by) % appConfig.cardSize === 0) {

            const giftsUsed = (Math.abs(historyEntry.by) / appConfig.cardSize);
            const discountCash = giftsUsed * appConfig.discount;

            return (
                <div className="LastHistoryEntry">
                    <div className="LastHistoryEntry__icon --gift">
                        <Icon
                            iconName={IconName.Gift}
                            color="white"
                            width={20}
                            height={20}
                        />
                    </div>
                    <span className="LastHistoryEntry__title-operation">
                        Otrzymujesz rabat!
                    </span>
                    <span className="LastHistoryEntry__title-amount">
                        <strong>
                            {giftsUsed}
                        </strong>
                        {discountLabelForUserUpdate(giftsUsed)} = {discountCash} PLN
                    </span>
                    <div className="LastHistoryEntry__stamps" />
                </div>
            )
        }
        return (
            <>
                <div className="LastHistoryEntry">
                    <div className="LastHistoryEntry__icon-remove">
                        <Icon
                            iconName={IconName.StampRemove}
                            width={50}
                            height={50}
                        />
                    </div>
                    <span className="LastHistoryEntry__title-operation">
                        Z twojego konta odebrano
                    </span>
                    <span className="LastHistoryEntry__title-amount">
                        <strong>
                            {historyEntry.by}
                        </strong>
                        {stampsLabelForUserUpdate(Math.abs(historyEntry.by))}
                    </span>
                    <div className="LastHistoryEntry__stamps" />
                </div>
            </>
        )
    }
}

export default LastHistoryEntry;

const stampsLabelForUserUpdate = (amount: number): string => {
    if (amount === 1) {
        return 'pieczątkę';
    }

    if ([12, 13, 14].includes(amount)) {
        return 'pieczątek';
    }

    const toStr = `${amount}`;
    if (["2", "3", "4"].includes(toStr[toStr.length - 1])) {
        return 'pieczątki';
    }

    return 'pieczątek';
}

const giftsLabelForUserUpdate = (amount: number): string => {
    if (amount === 1) {
        return 'kartę rabatową';
    }

    if ([12, 13, 14].includes(amount)) {
        return 'kart rabatowych';
    }

    const toStr = `${amount}`;
    if (["2", "3", "4"].includes(toStr[toStr.length - 1])) {
        return 'karty rabatowe';
    }

    return 'kart rabatowych';
}

const discountLabelForUserUpdate = (amount: number): string => {
    if (amount === 1) {
        return 'karta';
    }

    if ([12, 13, 14].includes(amount)) {
        return 'kart';
    }

    const toStr = `${amount}`;
    if (["2", "3", "4"].includes(toStr[toStr.length - 1])) {
        return 'karty';
    }

    return 'kart';
}