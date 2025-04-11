import { FC, useCallback } from "react";
import './RichNumberInput.css';

const RichNumberInput: FC<{
    value: number,
    setValue: (newValue: number) => void;
    label: string;
    minValue: number;
    maxValue: number;
    addClassName?: string;
    subtractClassName?: string;
}> = ({
    value,
    setValue,
    label,
    minValue,
    maxValue,
    addClassName,
    subtractClassName
}) => {


        const changeBy = useCallback((by: number) => {
            const nextValue = value + by < 1 ? 1 : value + by;
            setValue(nextValue);
        }, [setValue, value]);

        return (
            <div className="RichNumberInput">

                <span className="RichNumberInput__label">
                    {label}
                </span>
                <div className="RichNumberInput__input-wrapper">
                    {[-3, -1].map(by => (
                        <button
                            key={by}
                            onClick={() => changeBy(by)}
                            className={'RichNumberInput__btn --negative ' + subtractClassName}
                        >
                            {by}
                        </button>
                    ))}
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
                    {[1, 3].map(by => (
                        <button
                            key={by}
                            onClick={() => changeBy(by)}
                            className={'RichNumberInput__btn --positive ' + addClassName}
                        >
                            +{by}
                        </button>
                    ))}
                </div>

                <div className="RichNumberInput__buttons-row">
                    {[-10, -7, -5, 5, 7, 10].map(by => {
                        return (
                            <button
                                key={by}
                                onClick={() => changeBy(by)}
                                className={'RichNumberInput__btn ' + ` ${by > 0 ? '--positive' : "--negative"} ` + (by > 0 ? addClassName : subtractClassName)}

                            >
                                {by > 0 ? `+${by}` : by}
                            </button>
                        )
                    })}
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

            </div>
        )
    }

export default RichNumberInput;