import { FC } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import { OtherUser } from "../../../storage/users/users-types";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";

const Delete: FC<{
    cardId: string,
    user: OtherUser,
    deleteStamps: (value: number) => void,
    appConfig: AppConfig,
    goHistoryView: (userId: string) => void
}> = ({
    cardId,
    user,
    deleteStamps,
    appConfig,
    goHistoryView
}) => {

        const userGiftsAmount = Math.floor((user?.stamps.amount ?? 0) / appConfig.cardSize);

        return (
            <>
                <UserShort
                    userId={cardId}
                    userEmail={user.email}
                    userStampsAmount={user.stamps.amount}
                    userCard={!!user?.card}
                    isVerified={!!user?.verification?.isVerified}
                    isAgreements={!!user?.agreements}
                    userGiftsAmount={userGiftsAmount}
                    onHistoryClick={() => goHistoryView(user._id)}
                />
                <RichNumberForm
                    key='remove'
                    inputLabel="Ile pieczątek skasować?"
                    submitClassName='ScanningSectionDelete__button-submit-remove'
                    buttonLabel={(submitValue: number) => {
                        return <>
                            <Icon iconName={IconName.StampRemove} color="var(--remove-stamp)" />Usuń {submitValue} pieczątki
                        </>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Usuwasz <strong>{submitValue}</strong> pieczątki. Odpowiada to:<br />
                            - {Math.floor(submitValue / appConfig.cardSize)} całym kartom rabatowym i...<br />
                            - ...{submitValue - Math.floor(submitValue / appConfig.cardSize) * appConfig.cardSize} pieczątkom reszty<br />
                            - {user.stamps.amount - submitValue} pieczątek pozostanie na koncie klienta.
                        </span>
                    )}
                    onSubmit={(submitValue: number) => deleteStamps(submitValue)}
                    minValue={0}
                    maxValue={user.stamps.amount}
                />
            </>
        )
    }

export default Delete;
