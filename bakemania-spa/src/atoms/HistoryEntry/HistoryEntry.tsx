import React, { useState } from 'react';
import './HistoryEntry.css';
import Icon from '../../icons/Icon';
import IconName from '../../icons/IconName';

const HistoryEntry: React.FC<{
    createdAt: string;
    by: number;
    balance: number;
    assistantEmail?: string;
    userEmail?: string;
    cardSize: number;
    assistantId: string;
    userId: string;
    operations?: (isExpanded: boolean, setIsExpanded: (param: boolean) => void) => JSX.Element
}> = ({
    createdAt,
    by, balance,
    assistantEmail,
    userEmail,
    cardSize,
    operations,
}) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const isGift = by < 0 && by % cardSize === 0;
        const isStampRemoval = by < 0 && by % cardSize !== 0;

        const getIcon = () => {
            if (isGift) return <Icon iconName={IconName.Gift} color='white' width={24} height={24} />;
            if (isStampRemoval) return <Icon iconName={IconName.StampRemove} color='white' width={24} height={24} />;
            return <Icon iconName={IconName.Stamp} color='white' width={24} height={24} />;
        };

        const getColors = () => {
            if (isGift) return {
                iconBackground: 'var(--bakemaniaGold)',
                textColor: 'var(--bakemaniaGold)'
            };
            if (isStampRemoval) return {
                iconBackground: 'var(--remove-stamp)',
                textColor: 'var(--remove-stamp)'
            };
            return {
                iconBackground: 'var(--earn-stamp)',
                textColor: 'var(--earn-stamp)'
            };
        };

        const formatDate = (date: string) => {
            return new Date(date).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const colors = getColors();

        return (
            <div
                className="HistoryEntry"
                style={{
                    '--icon-background': colors.iconBackground,
                    '--text-color': colors.textColor
                } as React.CSSProperties}
            >
                <div className="HistoryEntry__icon">
                    {getIcon()}
                </div>

                <div className="HistoryEntry__content">
                    <div className="HistoryEntry__details">
                        <span className="HistoryEntry__operation">
                            {isGift ? 'Odebrano rabat' :
                                isStampRemoval ? 'Usunięto pieczątki' :
                                    'Dodano pieczątki'}
                        </span>
                        <span className="HistoryEntry__date">
                            {formatDate(createdAt)}
                        </span>
                        {userEmail && (
                            <span className="HistoryEntry__userEmail">
                                Dla: {userEmail}
                            </span>
                        )}
                        {assistantEmail && (
                            <span className="HistoryEntry__assistantEmail">
                                Przez: {assistantEmail}
                            </span>
                        )}
                    </div>

                    <div className="HistoryEntry__amounts">
                        <span className="HistoryEntry__change">
                            {by > 0 ? '+' : ''}{by} pieczątki
                        </span>
                        <span className="HistoryEntry__balance">
                            Saldo: {balance}
                        </span>
                    </div>
                </div>

                {operations && operations(isExpanded, setIsExpanded)}

            </div>
        );
    };

export default HistoryEntry;
