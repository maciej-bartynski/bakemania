import { FC, ReactNode, useState } from 'react';
import './RichNumberForm.css';
import RichNumberInput from '../../atoms/RichNumberInput/RichNumberInput';

const RichNumberForm: FC<{
    onSubmit: (submitValue: number) => void;
    inputLabel: string;
    buttonLabel?: (submitValue: number) => ReactNode;
    descriptionLabel?: (submitValue: number) => ReactNode;
    minValue: number,
    maxValue?: number,
    rangeMaxValue: number,
    currencyIcon?: ReactNode,
    step?: number,
}> = ({
    onSubmit,
    inputLabel,
    buttonLabel = (submitValue: number) => submitValue,
    descriptionLabel = (submitValue: number) => (
        <span>
            Wybrana ilość: <strong>{submitValue}</strong>
        </span>
    ),
    minValue,
    maxValue,
    currencyIcon,
    rangeMaxValue,
    step = 1
}) => {
        const [value, setValue] = useState(minValue);

        return (
            <div className='RichNumberForm'>
                <RichNumberInput
                    value={value}
                    setValue={setValue}
                    label={inputLabel}
                    minValue={minValue}
                    maxValue={maxValue}
                    rangeMaxValue={rangeMaxValue}
                    currencyIcon={currencyIcon}
                    step={step}
                />

                <button
                    onClick={() => onSubmit(value)}
                    disabled={value === 0}
                >
                    {buttonLabel(value)}
                </button>

                <div className="RichNumberForm__description">
                    {descriptionLabel(value)}
                </div>
            </div>
        )
    }

export default RichNumberForm;