import { FC, ReactNode, useCallback } from "react";
import './RichNumberInput.css';
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";

const RichNumberInput: FC<{
    value: number,
    setValue: (newValue: number) => void;
    label: string;
    minValue: number;
    maxValue: number;
    currencyIcon?: ReactNode;
    step?: number;
}> = ({
    value,
    setValue,
    label,
    minValue,
    maxValue,
    currencyIcon,
    step = 1
}) => {

        const changeBy = useCallback((by: number) => {
            const nextValue = value + by < 0 ? 0 : value + by;
            setValue(nextValue);
        }, [setValue, value]);

        return (
            <div className="RichNumberInput">
                <span className="RichNumberInput__label">
                    {label}
                </span>
                <div className="RichNumberInput__input-wrapper">

                    {(
                        [-3, -2, -1].map(by => (
                            <button
                                key={by}
                                onClick={() => changeBy(by)}
                                className={`RichNumberInput__btn --negative --value-${Math.abs(by)}`}
                            >
                                {by === -1 && <Icon iconName={IconName.ChevronLeft} color="var(--remove-stamp)" />}
                                {by === -2 && <Icon iconName={IconName.ChevronDoubleLeft} color="var(--remove-stamp)" />}
                                {by === -3 && <Icon iconName={IconName.ChevronTripleLeft} color="var(--remove-stamp)" />}
                            </button>
                        ))
                    )}
                    <div className="RichNumberInput__input-num-wrapper">

                        <input
                            className="RichNumberInput__input-num"
                            type="number"
                            value={value}
                            name={label}
                            onChange={(e) => {
                                const numValue = +(e.target.value);
                                setValue(numValue);
                            }}
                        />
                        <div className="RichNumberInput__currencyIcon">
                            {currencyIcon}
                        </div>
                    </div>

                    {(
                        [1, 2, 3].map(by => (
                            <button
                                key={by}
                                onClick={() => changeBy(by)}
                                className={`RichNumberInput__btn --positive --value-${Math.abs(by)}`}
                            >
                                {by === 1 && <Icon iconName={IconName.Chevron} color="var(--earn-stamp)" />}
                                {by === 2 && <Icon iconName={IconName.ChevronDouble} color="var(--earn-stamp)" />}
                                {by === 3 && <Icon iconName={IconName.ChevronTriple} color="var(--earn-stamp)" />}
                            </button>
                        ))
                    )}
                </div>
                <div className="RichNumberInput__input-range-wrapper">
                    <input
                        type='range'
                        min={minValue}
                        max={maxValue}
                        step={step}
                        value={value}
                        onChange={(e) => {
                            const val = +(e.target.value);
                            setValue(val);
                        }}
                    />
                </div>

                {/* <span className="RichNumberInput__label">
                    Zwiększaj/zmniejszaj:
                </span>
                {!dynamicButtons && (
                    <>
                        <div className="RichNumberInput__input-wrapper">
                            {!dynamicButtons && (
                                [-3, -1].map(by => (
                                    <button
                                        key={by}
                                        onClick={() => changeBy(by)}
                                        className={'RichNumberInput__btn --negative '}
                                    >
                                        {by} {negativeCurrencyIcon ?? currencyIcon}
                                    </button>
                                ))
                            )}

                            {!dynamicButtons && (
                                [1, 3].map(by => (
                                    <button
                                        key={by}
                                        onClick={() => changeBy(by)}
                                        className={'RichNumberInput__btn --positive '}
                                    >
                                        +{by} {currencyIcon}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="RichNumberInput__input-wrapper">
                            {!dynamicButtons && (
                                [-7, -5].map(by => (
                                    <button
                                        key={by}
                                        onClick={() => changeBy(by)}
                                        className={'RichNumberInput__btn --negative '}
                                    >
                                        {by} {negativeCurrencyIcon ?? currencyIcon}
                                    </button>
                                ))
                            )}

                            {!dynamicButtons && (
                                [5, 7].map(by => (
                                    <button
                                        key={by}
                                        onClick={() => changeBy(by)}
                                        className={'RichNumberInput__btn --positive '}
                                    >
                                        +{by} {currencyIcon}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="RichNumberInput__input-wrapper">
                            {!dynamicButtons && (
                                [-10].map(by => (
                                    <button
                                        key={by}
                                        onClick={() => changeBy(by)}
                                        className={'RichNumberInput__btn --negative '}
                                    >
                                        {by} {negativeCurrencyIcon ?? currencyIcon}
                                    </button>
                                ))
                            )}

                            {!dynamicButtons && (
                                [10].map(by => (
                                    <button
                                        key={by}
                                        onClick={() => changeBy(by)}
                                        className={'RichNumberInput__btn --positive '}
                                    >
                                        +{by} {currencyIcon}
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                )}

                {dynamicButtons && (
                    <div className="RichNumberInput__buttons-row">
                        {dynamicButtons.map(value => {
                            return (
                                <button
                                    key={value}
                                    onClick={() => setValue(value)}
                                    className={'RichNumberInput__btn --positive'}
                                >
                                    {value} {currencyIcon}
                                </button>
                            )
                        })}
                    </div>
                )} */}
            </div>
        )
    }

export default RichNumberInput;