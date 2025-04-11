import { FC } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import { OtherUser } from "../../../storage/users/users-types";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";

const EarnForAmount: FC<{
    cardId: string,
    user: OtherUser,
    appConfig: AppConfig,
    earnStamps: (amount: number) => void,
    goHistoryView: (userId: string) => void
}> = ({
    cardId,
    user,
    appConfig,
    earnStamps,
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
                    submitClassName='ScanningSectionEarnForAmount__button-submit-earn'
                    addClassName='ScanningSectionEarnForAmount__button-add'
                    subtractClassName='ScanningSectionEarnForAmount__button-remove'
                    key='stamps'
                    inputLabel="Ile pieczątek nabić?"
                    buttonLabel={(submitValue: number) => {
                        return <>
                            <Icon iconName={IconName.StampForCash} color="white" />
                            Nabij {submitValue}
                        </>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Kwota zakupów:<br />
                            - od <strong>{submitValue * appConfig.cardSize}.00 PLN</strong><br />
                            - do <strong>{((submitValue + 1) * appConfig.cardSize) - 0.01} PLN</strong>
                        </span>
                    )}
                    onSubmit={earnStamps}
                    minValue={1}
                    maxValue={100}
                />
            </>
        )
    }

export default EarnForAmount;
