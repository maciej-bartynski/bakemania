import { FC } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import { OtherUser } from "../../../storage/users/users-types";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";

const EarnForAmount: FC<{
    user: OtherUser,
    appConfig: AppConfig,
    earnStamps: (amount: number) => void,
    goHistoryView: (userId: string) => void,
    renderTabs: () => React.ReactNode
}> = ({
    user,
    appConfig,
    earnStamps,
    goHistoryView,
    renderTabs
}) => {
        const userGiftsAmount = Math.floor((user?.stamps.amount ?? 0) / appConfig.cardSize);

        return (
            <>
                <UserShort
                    userId={user._id}
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
                {renderTabs()}
                <RichNumberForm
                    currencyIcon={"PLN"}
                    key='stamps'
                    inputLabel="Za jaką kwotę nabić?"
                    buttonLabel={(submitValue: number) => {
                        const stampsAmount = Math.floor(submitValue / appConfig.discount);
                        return <strong style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "white",
                            justifyContent: "center"
                        }}>
                            Nabij {stampsAmount}<Icon iconName={IconName.Stamp} color="white" width={16} height={16} /> za {submitValue} PLN
                        </strong>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            <strong>{Math.floor(submitValue / appConfig.discount)}</strong> pieczątek<br />
                            - Przedział od <strong>{Math.floor(submitValue / appConfig.discount) * appConfig.discount}.00 PLN</strong><br />
                            - Przedział do <strong>{(Math.floor(submitValue / appConfig.discount) * appConfig.discount + appConfig.discount) - 0.01} PLN</strong>
                        </span>
                    )}
                    onSubmit={(submitValue: number) => {
                        const stampsAmount = Math.floor(submitValue / appConfig.discount);
                        if (stampsAmount > 0) {
                            earnStamps(stampsAmount)
                        }
                    }}
                    minValue={0}
                    maxValue={100}
                />
            </>
        )
    }

export default EarnForAmount;
