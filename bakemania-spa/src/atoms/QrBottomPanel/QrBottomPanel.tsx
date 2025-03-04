import { FC } from "react";
import QRCode from "react-qr-code";
import './QrBottomPanel.css';

const QrBottomPanel: FC<{
    cardId: string,
    show: boolean,
    toggleBottomPanel: () => void,
    variant?: 'spend'
}> = ({ cardId, show, variant, toggleBottomPanel }) => {
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
                        value={JSON.stringify({ variant: variant == 'spend' ? 'spend' : 'earn', cardId })}
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
