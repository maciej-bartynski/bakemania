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
    toggleHistoryView: (userId: string) => void;
    toggleCardDetailsView: (details?: {
        cardId: string;
        variant: "spend" | "earn";
        userId: string;
        assistantId: string;
    }) => void
}> = ({ createdAt, by, balance, assistantEmail, userEmail, cardSize, toggleCardDetailsView, assistantId, userId, toggleHistoryView }) => {
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

            <button
                className="HistoryEntry__detailsButton"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Icon iconName={IconName.Cog} color='var(--customer)' width={20} height={20} />
            </button>

            <div className={`HistoryEntry__options ${isExpanded ? 'HistoryEntry__options--expanded' : ''}`}>
                <div className="HistoryEntry__optionsContent">
                    <button
                        className="HistoryEntry__option"
                        style={{
                            color: 'var(--customer)',
                            strokeWidth: 2
                        }}
                        onClick={() => {
                            toggleCardDetailsView({
                                cardId: 'change-force',
                                variant: 'spend',
                                userId,
                                assistantId
                            })
                        }}
                    >
                        <Icon iconName={IconName.QrCode} color='var(--customer)' width={16} height={16} />
                        Operacje
                    </button>
                    <button
                        className="HistoryEntry__option"
                        style={{
                            color: 'var(--customer)',
                            strokeWidth: 2
                        }}
                        onClick={() => {
                            toggleHistoryView(userId)
                        }}
                    >
                        <Icon iconName={IconName.History} color='var(--customer)' width={16} height={16} />
                        Użytkownik
                    </button>
                    <button
                        className="HistoryEntry__option"
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
    );
};

export default HistoryEntry;
