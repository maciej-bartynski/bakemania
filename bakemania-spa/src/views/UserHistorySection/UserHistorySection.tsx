import { FC } from 'react';
import './UserHistorySection.css';
import HistoryEntry from '../../atoms/HistoryEntry/HistoryEntry';
import AppUser from '../../atoms/AppUser/AppUser';
import UserRole from '../../storage/me/me-types';

type UserHistorySectionProps = {
    userEmail: string;
    transactions: Array<{
        _id: string;
        createdAt: string;
        by: number;
        balance: number;
        assistantEmail?: string;
        cardSize: number;
        assistantId: string;
        userId: string;
    }>;
    toggleHistoryView: (userId: string) => void;
    toggleCardDetailsView: (details?: {
        cardId: string;
        variant: "spend" | "earn";
        userId: string;
        assistantId: string;
    }) => void;
};

const UserHistorySection: FC<UserHistorySectionProps> = ({
    userEmail,
    transactions,
    toggleHistoryView,
    toggleCardDetailsView
}) => {
    return (
        <div className="user-history-section">
            <h2 className="user-history-section__header">
                <div className="user-history-section__header-content">
                    <span>Historia operacji dla </span>
                    <AppUser email={userEmail} role={UserRole.User} />
                </div>
            </h2>
            <div className="user-history-section__list">
                {transactions.map(entry => (
                    <HistoryEntry
                        key={entry._id}
                        createdAt={entry.createdAt}
                        by={entry.by}
                        balance={entry.balance}
                        assistantEmail={entry.assistantEmail}
                        cardSize={entry.cardSize}
                        assistantId={entry.assistantId}
                        userId={entry.userId}
                        toggleHistoryView={toggleHistoryView}
                        toggleCardDetailsView={toggleCardDetailsView}
                    />
                ))}
            </div>
        </div>
    );
};

export default UserHistorySection; 