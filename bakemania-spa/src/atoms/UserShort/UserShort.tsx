import { FC } from "react";
import './UserShort.css'

const UserShort: FC<{
    userId: string;
    userEmail?: string,
    userStampsAmount?: number,
    userGiftsAmount?: number,
}> = ({
    userId,
    userEmail,
    userStampsAmount,
    userGiftsAmount
}) => {
        return (
            <div className="UserShort">
                {userId && (
                    <div className="UserShort__row">
                        <span className="UserShort__row-line">
                            ID: <strong>{userId}</strong>
                        </span>
                    </div>
                )}
                {userEmail && (
                    <div className="UserShort__row">
                        <span className="UserShort__row-line">
                            Klient: <strong>{userEmail}</strong>
                        </span>
                    </div>
                )}

                {(typeof userStampsAmount === 'number' || typeof userGiftsAmount === 'number') && (
                    <div className="UserShort__row">
                        <span className="UserShort__row-line">
                            Posiada <strong>{userStampsAmount}</strong> pieczątek (<strong>{userGiftsAmount}</strong> karty)
                        </span>
                    </div>
                )}
            </div>
        )
    }


export default UserShort;