import { FC } from "react";
import './DiscountCard.css';

const DiscountCard: FC<{
    onClick?: () => void;
    disabled?: boolean;
    additional?: string;
}> = ({
    onClick,
    disabled = false,
    additional = ''
}) => {
        return (
            <div
                className="discount"
                onClick={onClick}
                style={{
                    filter: disabled ? "grayscale()" : 'none',
                    opacity: disabled ? .5 : 1
                }}
            >
                <div className="discount-card__header">
                    <div className="discount-card__title">
                        <span>bakeMAnia</span>
                    </div>
                    <span className="discount-card__subtitle">twój rabat {additional}</span>

                    <div className="discount-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke=" var(--bakemaniaGold)"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" />
                            <path d="M12 8l0 13" /><path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" />
                            <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5" />
                        </svg>
                    </div>

                    {disabled && (
                        <div className="discount-card__message">
                            <span>dotknij by użyć</span>
                        </div>
                    )}
                </div>
            </div>
        )
    }

export default DiscountCard;