import { FC } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import { OtherUser } from "../../../storage/users/users-types";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";

const Spend: FC<{
    cardId: string,
    user: OtherUser,
    appConfig: AppConfig,
    spendStamps: (amount: number) => void
}> = ({
    cardId,
    user,
    appConfig,
    spendStamps
}) => {
        const userGiftsAmount = Math.floor((user?.stamps.amount ?? 0) / appConfig.cardSize);

        return (
            <>
                <UserShort
                    userId={cardId}
                    userEmail={user.email}
                    userStampsAmount={user.stamps.amount}
                    userGiftsAmount={Math.floor((user.stamps.amount ?? 0) / appConfig.cardSize)}
                    userCard={!!user?.card}
                    isVerified={!!user?.verification?.isVerified}
                    isAgreements={!!user?.agreements}
                />
                <RichNumberForm
                    key='gifts'
                    inputLabel="Ile kart rabatowych użyć?"
                    addClassName='ScanningSectionSpend__button-add'
                    subtractClassName='ScanningSectionSpend__button-remove'
                    submitClassName='ScanningSectionSpend__button-submit-spend'
                    buttonLabel={(submitValue: number) => {
                        return <>
                            <Icon iconName={IconName.Gift} color="white" />Przyznaj rabat ${submitValue * appConfig.discount}.00 PLN (${submitValue} karty)
                        </>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Przyznajesz rabat:<br />
                            - <strong>{submitValue * appConfig.discount}.00 PLN</strong><br />
                            - <strong>{submitValue} karty</strong>
                        </span>
                    )}
                    onSubmit={(submitValue: number) => spendStamps(submitValue * appConfig.cardSize)}
                    minValue={userGiftsAmount >= 1 ? 1 : 0}
                    maxValue={userGiftsAmount >= 1 ? userGiftsAmount : 0}
                />
            </>
        );
    }

export default Spend;