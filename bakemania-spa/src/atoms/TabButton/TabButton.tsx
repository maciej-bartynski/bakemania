import { FC } from 'react';
import './TabButton.css';
import Icon from '../../icons/Icon';
import IconName from '../../icons/IconName';

interface TabButtonProps {
    iconName: IconName;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'delete';
    selected?: boolean;
}

const TabButton: FC<TabButtonProps> = ({
    iconName,
    label,
    onClick,
    variant = 'primary',
    selected = false
}) => {
    return (
        <button
            className={`TabButton ${selected ? 'TabButton--active' : ''} TabButton--${variant}`}
            onClick={onClick}
        >
            <div className="TabButton__content">
                <Icon iconName={iconName} color="currentColor" />
                <span className="TabButton__label">{label}</span>
            </div>
        </button>
    );
};

export default TabButton; 