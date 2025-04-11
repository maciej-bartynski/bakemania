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
    appConfig: AppConfig,
    deleteStamps: (amount: number) => void,
    goHistoryView: (userId: string) => void
}> = ({
    cardId,
    user,
    appConfig,
    deleteStamps,
    goHistoryView
}) => {
        const userGiftsAmount = Math.floor((user?.stamps.amount ?? 0) / appConfig.cardSize);

        return (
            <>
                <UserShort
                    userId={cardId}
                    userEmail={user?.email}
                    userStampsAmount={user?.stamps.amount}
                    userGiftsAmount={userGiftsAmount}
                    userCard={!!user?.card}
                    isVerified={!!user?.verification?.isVerified}
                    isAgreements={!!user?.agreements}
                    actionButtons={[
                        {
                            label: "Historia",
                            onClick: () => goHistoryView(user._id),
                            icon: IconName.History
                        }
                    ]}
                />
                <RichNumberForm
                    submitClassName='ScanningSectionDelete__button-submit-delete'
                    addClassName='ScanningSectionDelete__button-add'
                    subtractClassName='ScanningSectionDelete__button-remove'
                    key='stamps'
                    inputLabel="Ile pieczątek skasować?"
                    buttonLabel={(submitValue: number) => {
                        return <>
                            <Icon iconName={IconName.StampRemove} color="white" />
                            Skasuj {submitValue}
                        </>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Kwota zakupów:<br />
                            - od <strong>{submitValue * appConfig.cardSize}.00 PLN</strong><br />
                            - do <strong>{((submitValue + 1) * appConfig.cardSize) - 0.01} PLN</strong>
                        </span>
                    )}
                    onSubmit={deleteStamps}
                    minValue={1}
                    maxValue={100}
                />
            </>
        )
    }

export default Delete;
