import { FC, ReactNode, useState } from 'react';
import './RichNumberForm.css';
import RichNumberInput from '../../atoms/RichNumberInput/RichNumberInput';

const RichNumberForm: FC<{
    onSubmit: (submitValue: number) => void;
    inputLabel: string;
    buttonLabel?: (submitValue: number) => string;
    descriptionLabel?: (submitValue: number) => ReactNode;
    minValue: number,
    maxValue: number,
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
    maxValue
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
                />

                <button
                    onClick={() => onSubmit(value)}
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