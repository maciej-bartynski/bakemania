import { FC } from "react";
import QRCode from "react-qr-code";
import './QrBottomPanel.css';
import Config from "../../config";

const QrBottomPanel: FC<{
    userId: string,
    show: boolean,
    toggleBottomPanel: () => void,
    variant?: 'spend'
}> = ({ userId, show, variant, toggleBottomPanel }) => {

    const cardId = window.localStorage.getItem(Config.sessionKeys.CardId);

    console.log("variant", variant);
    console.log("userId", userId);
    console.log("cardId", cardId);

    return (
        <>
            {show && <div className="overlay" onClick={toggleBottomPanel}></div>}
            <aside className={`panel ${show ? "visible" : "hidden"}`}>
                {variant == 'spend' ? (
                    <span>
                        Odbierz rabat:
                    </span>
                ) : (
                    <span>
                        Nabij pieczątkę:
                    </span>
                )}
                <div className="panel__wrapper">
                    <QRCode
                        value={JSON.stringify({
                            variant: variant == 'spend' ? 'spend' : 'earn-for-amount',
                            cardId,
                            userId,
                        })}
                        size={300}
                        className="qr-code"
                    />
                </div>
                <button className="hide-button" onClick={toggleBottomPanel}>
                    Schowaj
                </button>
            </aside>
        </>
    );
};

export default QrBottomPanel;
