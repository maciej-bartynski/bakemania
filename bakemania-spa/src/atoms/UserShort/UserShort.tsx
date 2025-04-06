import { FC } from "react";
import './UserShort.css'
import UserIcon from "../../icons/UserIcon";
import IconName from "../../icons/IconName";
import Icon from "../../icons/Icon";

const UserShort: FC<{
    userId: string;
    userEmail: string,
    userStampsAmount: number,
    userGiftsAmount: number,
    userCard: boolean,
    isVerified: boolean,
    isAgreements: boolean,
    onHistoryClick?: () => void,
    actionButton?: React.ReactNode
}> = ({
    userId,
    userEmail,
    userStampsAmount,
    userGiftsAmount,
    userCard,
    isVerified,
    isAgreements,
    onHistoryClick,
    actionButton
}) => {
        return (
            <div className="UserShort">
                <div className="UserShort__icon">
                    <UserIcon.Customer color="white" />
                </div>
                <div className="UserShort__info">
                    {userId && userId !== 'change-force' && (
                        <div className="UserShort__row">
                            <span className="UserShort__row-line">
                                ID: <strong>{userId}</strong>
                            </span>
                        </div>
                    )}

                    {!isAgreements && (
                        <div className="UserShort__row">
                            <span className="UserShort__row-line">
                                <Icon iconName={IconName.Cog} color="var(--remove-stamp)" width={16} height={16} />
                                <span className="UserShort__row-line-text" style={{ color: 'var(--remove-stamp)' }}>
                                    <strong>Klien nie zaakceptował warunków użytkowania</strong>
                                </span>
                            </span>
                        </div>
                    )}

                    {!isVerified && (
                        <div className="UserShort__row">
                            <span className="UserShort__row-line">
                                <Icon iconName={IconName.Users} color="var(--remove-stamp)" width={16} height={16} />
                                <span className="UserShort__row-line-text" style={{ color: 'var(--remove-stamp)' }}>
                                    <strong>Klien nie zweryfikował swojego konta</strong>
                                </span>
                            </span>
                        </div>
                    )}

                    {!userCard && (
                        <div className="UserShort__row">
                            <span className="UserShort__row-line">
                                <Icon iconName={IconName.QrCode} color="var(--remove-stamp)" width={16} height={16} />
                                <span className="UserShort__row-line-text" style={{ color: 'var(--remove-stamp)' }}>
                                    <strong>Klien nie posiada karty QR</strong>
                                </span>
                            </span>
                        </div>
                    )}

                    {userEmail && (
                        <div className="UserShort__row" style={{ marginBottom: '6px' }}>
                            <span className="UserShort__row-line">
                                <strong className="UserShort__row-email">{userEmail}</strong>
                            </span>
                        </div>
                    )}

                    {(typeof userStampsAmount === 'number' || typeof userGiftsAmount === 'number') && (
                        <div className="UserShort__row">
                            <span className="UserShort__row-line" style={{ strokeWidth: '2' }}>
                                <Icon iconName={IconName.Stamp} color="var(--customer)" width={16} height={16} />
                                <span className="UserShort__row-line-text" style={{ marginTop: '2px' }}>
                                    <strong>{userStampsAmount}</strong> pieczątek
                                </span>
                            </span>

                            <span className="UserShort__row-line" style={{ strokeWidth: '2' }}>
                                <Icon iconName={IconName.Gift} color="var(--customer)" width={16} height={16} />
                                <span className="UserShort__row-line-text" style={{ marginTop: '2px' }}>
                                    <strong>{userGiftsAmount}</strong> kart
                                </span>
                            </span>
                        </div>
                    )}

                    <div className="UserShort__row">
                        {actionButton}
                        {onHistoryClick && (
                            <button
                                onClick={onHistoryClick}
                                className="secondary"
                                style={{
                                    height: 28,
                                    borderColor: 'var(--customer)',
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 5,
                                    color: 'var(--customer)',
                                    fontWeight: 400
                                }}
                            >
                                <Icon iconName={IconName.History} color="var(--customer)" width={16} height={16} />
                                Historia klienta
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }


export default UserShort;