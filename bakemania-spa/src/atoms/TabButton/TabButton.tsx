import { FC } from 'react';
import './TabButton.css';
import Icon from '../../icons/Icon';
import IconName from '../../icons/IconName';

interface TabButtonProps {
    iconName: IconName;
    label: string;
    onClick: () => void;
    activeColor?: string;
    selected?: boolean;
}

const TabButton: FC<TabButtonProps> = ({
    iconName,
    label,
    onClick,
    activeColor = 'primary',
    selected = false
}) => {
    return (
        <button
            className={`TabButton`}
            onClick={onClick}
            style={{ backgroundColor: selected ? activeColor : 'transparent' }}
        >
            <div className="TabButton__content">
                <Icon iconName={iconName} color={selected ? 'white' : 'var(--dark-color)'} />
                <span className="TabButton__label" style={{ color: selected ? 'white' : 'var(--dark-color)' }}>{label}</span>
            </div>
        </button>
    );
};

export default TabButton; 