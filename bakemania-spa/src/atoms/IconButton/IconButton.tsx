import { FC } from "react";
import './IconButton.css';
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";

const IconButton: FC<{
    iconName: IconName;
    iconColor?: string;
    textColor?: string;
    bgColor?: string;
    label: string;
    onClick: () => void;
}> = ({
    iconName,
    iconColor = "white",
    textColor = "var(--text)",
    bgColor = "var(--text)",
    label,
    onClick
}) => {
        return (
            <button
                className='icon-button'
                onClick={onClick}
            >
                <span
                    className='icon-button__icon'
                    style={{
                        background: bgColor
                    }}
                >
                    <Icon
                        iconName={iconName}
                        color={iconColor}
                    />
                </span>
                <span
                    className='icon-button__label'
                    style={{
                        color: textColor
                    }}
                >
                    {label}
                </span>
            </button>
        );
    }

export default IconButton;