import { FC, ReactNode, useState } from 'react';
import './RichNumberForm.css';
import RichNumberInput from '../../atoms/RichNumberInput/RichNumberInput';

const RichNumberForm: FC<{
    onSubmit: (submitValue: number) => void;
    inputLabel: string;
    buttonLabel?: (submitValue: number) => ReactNode;
    descriptionLabel?: (submitValue: number) => ReactNode;
    minValue: number,
    maxValue: number,
    submitClassName?: string,
    addClassName?: string,
    subtractClassName?: string,
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
    submitClassName,
    addClassName,
    subtractClassName,
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
                    addClassName={addClassName}
                    subtractClassName={subtractClassName}
                />

                <button
                    onClick={() => onSubmit(value)}
                    className={submitClassName}
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