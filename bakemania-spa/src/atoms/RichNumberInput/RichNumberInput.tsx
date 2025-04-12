import { FC, ReactNode, useCallback } from "react";
import './RichNumberInput.css';

const RichNumberInput: FC<{
    value: number,
    setValue: (newValue: number) => void;
    label: string;
    minValue: number;
    maxValue: number;
    currencyIcon?: ReactNode,
    negativeCurrencyIcon?: ReactNode,
    dynamicButtons?: number[],
}> = ({
    value,
    setValue,
    label,
    minValue,
    maxValue,
    currencyIcon,
    negativeCurrencyIcon,
    dynamicButtons
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
                </div>
                <div className="RichNumberInput__input-wrapper">
                    <input
                        type='range'
                        min={minValue}
                        max={maxValue}
                        step={1}
                        value={value}
                        onChange={(e) => {
                            const val = +(e.target.value);
                            setValue(val);
                        }}
                    />
                </div>

                <span className="RichNumberInput__label">
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
                )}
            </div>
        )
    }

export default RichNumberInput;