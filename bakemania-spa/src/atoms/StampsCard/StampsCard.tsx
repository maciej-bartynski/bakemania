import { FC } from "react";
import "./StampsCard.css";
import Stamp from "../Stamp/Stamp";
import iterateIcons from "../Stamp/Stamp.helper";

const StampsCard: FC<{
    stampsAmount: number,
    stampsInCard?: number,
    stampsInRow?: number,
    discount?: number
}> = ({ stampsAmount, stampsInCard = 7, stampsInRow = 5, discount = 15 }) => {
    const blackCircles = stampsAmount % stampsInCard;
    const totalRows = Math.ceil(stampsInCard / stampsInRow);
    const circles: JSX.Element[] = [];

    const iconsConfig = iterateIcons(blackCircles);
    for (let i = 0; i < stampsInCard; i++) {
        circles.push(
            <div
                key={i}
                className={`circle`}
            >
                {i < blackCircles ? (
                    <Stamp
                        stampConfig={iconsConfig[i]}
                    />
                ) : null
                }
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card__header">
                <div className="card__title">
                    <span>bakeMAnia</span>
                </div>
                <span className="card__subtitle">karta lojalnościowa</span>
            </div>

            <span
                style={{
                    display: 'block',
                    width: '100%',
                    fontSize: 8,
                }}
            >
                Za każde wydane <strong>{discount}</strong> zł otrzymasz <strong>1</strong> pieczątkę
            </span>

            <div style={{ height: 0 }} />
            {Array.from({ length: totalRows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="row"
                >
                    {circles.slice(rowIndex * stampsInRow, (rowIndex + 1) * stampsInRow)}
                </div>
            ))}

            <div style={{ height: 0 }} />

            <div className="card__message">
                <span>dotknij by użyć</span>
            </div>
        </div>
    );
};

export default StampsCard;