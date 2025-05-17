import { FC, ReactNode, useCallback, useState } from "react";
import './RichNumberInput.css';
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";

const RichNumberInput: FC<{
    value: number,
    setValue: (newValue: number) => void;
    label: string;
    minValue: number;
    maxValue?: number;
    rangeMaxValue: number;
    currencyIcon?: ReactNode;
    step?: number;
}> = ({
    value,
    setValue,
    label,
    minValue,
    maxValue,
    rangeMaxValue,
    currencyIcon,
    step = 1
}) => {
        const [inputValue, _setInputValue] = useState('0');
        const setInputValue = useCallback((newValue: string) => {
            _setInputValue(newValue);
            setValue(+(newValue));
        }, [_setInputValue, setValue]);

        const changeBy = useCallback((by: number) => {
            const nextValuePositive = value + by < 0 ? 0 : value + by;
            if (maxValue) {
                const nextValueValidated = nextValuePositive > maxValue ? maxValue : nextValuePositive;
                setInputValue(`${nextValueValidated}`);
            } else {
                setInputValue(`${nextValuePositive}`);
            }
        }, [setInputValue, value, maxValue]);

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
                            type="text"
                            inputMode="decimal"
                            value={inputValue}
                            name={label}
                            onChange={(e) => {
                                const input = e.target.value;
                                const cleaned = input.replace(/[^\d.,]/g, '');
                                const normalized = cleaned.replace(',', '.');
                                const parts = normalized.split('.');
                                if (parts.length > 2) {
                                    const validValue = parts[0] + '.' + parts.slice(1).join('');
                                    setInputValue(validValue);
                                } else {
                                    setInputValue(normalized);
                                }
                            }}
                        />
                        {/* 
                            <input
                                className="RichNumberInput__input-num"
                                type="number"
                                value={value}
                                name={label}
                                onChange={(e) => {
                                    const extractedValue = e.target.value;
                                    const numValue = +(extractedValue);
                                    setValue(numValue);
                                }}
                            /> 
                        */}
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
                        max={rangeMaxValue}
                        step={step}
                        value={value}
                        onChange={(e) => {
                            const val = (e.target.value);
                            setInputValue(val);
                        }}
                    />
                </div>
            </div>
        )
    }

export default RichNumberInput;