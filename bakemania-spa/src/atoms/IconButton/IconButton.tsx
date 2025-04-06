import { FC } from "react";
import './IconButton.css';
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";

const IconButton: FC<{
    iconName?: IconName;
    iconElement?: React.ReactNode;
    iconColor?: string;
    textColor?: string;
    bgColor?: string;
    label?: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}> = ({
    iconName,
    iconElement,
    iconColor = "white",
    textColor = "var(--text)",
    bgColor = "var(--text)",
    label,
    onClick,
    variant = 'primary'
}) => {
        return (
            <button
                className='icon-button'
                onClick={onClick}
            >
                <span
                    className='icon-button__icon'
                    style={{
                        background: variant === 'primary' ? bgColor : 'transparent',
                        border: 'solid 2px ' + bgColor,
                        strokeWidth: variant === 'primary' ? 1 : 2
                    }}
                >
                    {iconElement || <Icon
                        iconName={iconName ?? IconName.ArrowDown}
                        color={variant === 'primary' ? iconColor : bgColor}
                    />}
                </span>
                {label && (
                    <span
                        className='icon-button__label'
                        style={{
                            color: textColor
                        }}
                    >
                        {label}
                    </span>
                )}
            </button>
        );
    }

export default IconButton;