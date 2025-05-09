import React, { useState } from 'react';
import './UserShort.css'
import Icon from '../../icons/Icon';
import IconName from '../../icons/IconName';
import UserIcon from '../../icons/UserIcon';

interface ActionButton {
    label: string;
    onClick: () => void;
    icon: IconName;
}

interface UserShortProps {
    hideId?: boolean,
    userId: string;
    userEmail: string,
    userStampsAmount: number,
    userGiftsAmount: number,
    userCard: boolean,
    isVerified: boolean,
    isAgreements: boolean,
    actionButtons: ActionButton[];
}

const UserShort: React.FC<UserShortProps> = ({
    hideId,
    userId,
    userEmail,
    userStampsAmount,
    userGiftsAmount,
    userCard,
    isVerified,
    isAgreements,
    actionButtons
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="UserShort">
            <div className="UserShort__icon">
                <UserIcon.Customer color="white" width={24} height={24} />
            </div>
            <div className="UserShort__content">
                <div className="UserShort__details">
                    <div className="UserShort__row">
                        {hideId ? null : (<div className="UserShort__row-line id">
                            <strong>ID:</strong> {userId}
                        </div>)}
                        <div className="UserShort__row-email">
                            {userEmail}
                        </div>
                    </div>

                    {!isVerified && (
                        <div className="UserShort__row">
                            <div className="UserShort__row-line warning">
                                <Icon iconName={IconName.Destroy} color="var(--remove-stamp)" width={12} height={12} />
                                <span className="UserShort__row-line-text">Konto niezweryfikowane</span>
                            </div>
                        </div>
                    )}

                    {!isAgreements && (
                        <div className="UserShort__row">
                            <div className="UserShort__row-line warning">
                                <Icon iconName={IconName.Destroy} color="var(--remove-stamp)" width={12} height={12} />
                                <span className="UserShort__row-line-text">Niezaakceptowane regulaminy</span>
                            </div>
                        </div>
                    )}

                    {!userCard && (
                        <div className="UserShort__row">
                            <div className="UserShort__row-line warning">
                                <Icon iconName={IconName.Destroy} color="var(--remove-stamp)" width={12} height={12} />
                                <span className="UserShort__row-line-text">Brak karty QR</span>
                            </div>
                        </div>
                    )}

                    {(typeof userStampsAmount === 'number' || typeof userGiftsAmount === 'number') && (
                        <div className="UserShort__row">
                            <div className="UserShort__row-line success">
                                <Icon iconName={IconName.Stamp} color="var(--customer)" width={12} height={12} />
                                <span className="UserShort__row-line-text">
                                    <strong>{userStampsAmount}</strong> pieczątek
                                </span>
                            </div>

                            <div className="UserShort__row-line success">
                                <Icon iconName={IconName.Gift} color="var(--customer)" width={12} height={12} />
                                <span className="UserShort__row-line-text">
                                    <strong>{userGiftsAmount}</strong> kart
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button
                className="UserShort__detailsButton"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Icon iconName={IconName.Cog} color='var(--customer)' width={20} height={20} />
            </button>

            <div className={`UserShort__options ${isExpanded ? 'UserShort__options--expanded' : ''}`}>
                <div className="UserShort__optionsContent">
                    {actionButtons.map((button, index) => (
                        <button
                            key={index}
                            className="UserShort__option"
                            style={{
                                color: 'var(--customer)',
                                strokeWidth: 2
                            }}
                            onClick={() => {
                                button.onClick();
                                setIsExpanded(false);
                            }}
                        >
                            <Icon iconName={button.icon} color='var(--customer)' width={16} height={16} />
                            {button.label}
                        </button>
                    ))}
                    <button
                        className="UserShort__option"
                        onClick={() => setIsExpanded(false)}
                        style={{
                            strokeWidth: 2
                        }}
                    >
                        <Icon iconName={IconName.ArrowDown} width={16} height={16} />
                        Schowaj
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserShort;