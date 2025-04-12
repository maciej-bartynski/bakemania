import { FC } from "react"
import { StampsHistoryEntry } from "../../storage/me/me-types"
import './LastHistoryEntry.css';
import { AppConfig } from "../../storage/appConfig/appConfig-types";
import DiscountCard from "../DiscountCard/DiscountCard";
import Stamp from "../Stamp/Stamp";
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";

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
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 6,
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 16,
                        }}
                    >
                        <Icon iconName={IconName.Gift} color="var(--bakemaniaGold)" width={50} height={50} />
                    </div>
                    <span
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        Otrzymujesz<br /><strong
                            style={{
                                fontSize: 24,
                            }}
                        >rabat</strong><span style={{ fontSize: 24 }}> od bakeMAnii!</span>
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
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 6,
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 16,
                        }}
                    >
                        <Icon iconName={IconName.Stamp} color="var(--earn-stamp)" width={50} height={50} />
                    </div>
                    <span
                        style={{
                            textAlign: 'center',
                        }}
                    >
                        Otrzymujesz<br /><strong
                            style={{
                                fontSize: 24,
                            }}
                        >{historyEntry.by}x</strong><span style={{ fontSize: 24 }}> {format(historyEntry.by)}</span>
                    </span>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {Array.from({ length: historyEntry.by }).map((_, index) => (
                            <Stamp key={index} />
                        ))}
                    </div>
                </>
            )
        }
    }

    if (historyEntry.by < 0) {

        if (+(historyEntry.by) % appConfig.cardSize === 0) {
            return (
                <>
                    <>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 6,
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 16,
                            }}
                        >
                            <Icon iconName={IconName.Gift} color="var(--bakemaniaGold)" width={50} height={50} />
                        </div>
                        <span
                            style={{
                                textAlign: 'center',
                            }}
                        >
                            Naliczono zniżkę w wysokości<br /><strong
                                style={{
                                    fontSize: 24,
                                }}
                            >{appConfig.discount}</strong><span style={{ fontSize: 24 }}> PLN!</span>
                        </span>
                        <DiscountCard
                            disabled={true}
                        />
                    </>
                </>
            )
        }
        return (
            <>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                    }}
                >
                    <Icon iconName={IconName.StampRemove} width={50} height={50} />
                </div>
                <span
                    style={{
                        textAlign: 'center',
                    }}
                >
                    Z twojego konta odebrano<br /><strong
                        style={{
                            fontSize: 24,
                        }}
                    >{historyEntry.by}x</strong><span style={{ fontSize: 24 }}> {format(historyEntry.by)}</span>
                </span>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {Array.from({ length: historyEntry.by }).map((_, index) => (
                        <Stamp key={index} />
                    ))}
                </div>
            </>
        )
    }
}

export default LastHistoryEntry;

function format(value: number) {
    switch (value) {
        case 1:
            return 'pieczątkę';
        case 2:
        case 3:
        case 4:
        case 22:
        case 23:
        case 24:
            return 'pieczątki';
        default:
            return 'pieczątek';
    }
}