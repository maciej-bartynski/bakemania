import { FC } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import { OtherUser } from "../../../storage/users/users-types";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";

const EarnForAmoubnt: FC<{
    cardId: string,
    user: OtherUser,
    appConfig: AppConfig,
    earnStamps: (amount: number) => void
}> = ({
    cardId,
    user,
    appConfig,
    earnStamps
}) => {

        const amountToStamps = (cashAmount: number) => {
            return Math.floor(cashAmount / appConfig.discount);
        }

        const userGiftsAmount = Math.floor((user?.stamps.amount ?? 0) / appConfig.cardSize);

        return (
            <>
                <UserShort
                    userId={cardId}
                    userEmail={user.email}
                    userStampsAmount={user.stamps.amount}
                    userGiftsAmount={userGiftsAmount}
                    userCard={!!user?.card}
                    isVerified={!!user?.verification?.isVerified}
                    isAgreements={!!user?.agreements}
                />
                <RichNumberForm
                    key='stamps'
                    inputLabel="Ile PLN wydał klient?"
                    addClassName='ScanningSectionEarnForAmount__button-add'
                    subtractClassName='ScanningSectionEarnForAmount__button-remove'
                    submitClassName='ScanningSectionEarnForAmount__button-submit-earn-for-amount'
                    buttonLabel={(submitValue: number) => {
                        return <>
                            <Icon iconName={IconName.StampForCash} color="var(--earn-stamp)" />
                            Nabij {amountToStamps(submitValue)} pieczątek
                        </>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Kwota zakupów {submitValue} PLN to przedział:<br />
                            - od <strong>{amountToStamps(submitValue) * appConfig.discount}.00 PLN</strong><br />
                            - do <strong>{((amountToStamps(submitValue) + 1) * appConfig.discount) - 0.01} PLN</strong><br />
                            - Klient otrzyma <strong>{amountToStamps(submitValue)} pieczątek</strong>
                        </span>
                    )}
                    onSubmit={(submitValue: number) => earnStamps(amountToStamps(submitValue))}
                    minValue={0}
                    maxValue={200}
                />
            </>
        )
    }

export default EarnForAmoubnt;
