import { FC } from "react"
import UserShort from "../../../atoms/UserShort/UserShort"
import { AppConfig } from "../../../storage/appConfig/appConfig-types"
import { OtherUser } from "../../../storage/users/users-types"
import RichNumberForm from "../../RichNumberForm/RichNumberForm"
import Icon from "../../../icons/Icon"
import IconName from "../../../icons/IconName"

const Earn: FC<{
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
                    hideId={true}
                    userId={user._id}
                    userEmail={user.email}
                    userStampsAmount={user.stamps.amount}
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
                    key='stamps'
                    inputLabel="Ile pieczątek nabić?"
                    buttonLabel={(submitValue: number) => {
                        return <strong style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "white",
                            justifyContent: "center"
                        }}>
                            <Icon iconName={IconName.Stamp} color="white" />
                            Nabij {submitValue}
                        </strong>
                    }}
                    currencyIcon={<Icon iconName={IconName.Stamp} color="var(--earn-stamp)" width={18} height={18} />}
                    negativeCurrencyIcon={<Icon iconName={IconName.StampRemove} color="var(--remove-stamp)" width={18} height={18} />}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Kwota zakupów:<br />
                            - od <strong>{submitValue * appConfig.discount}.00 PLN</strong><br />
                            - do <strong>{((submitValue + 1) * appConfig.discount) - 0.01} PLN</strong>
                        </span>
                    )}
                    onSubmit={earnStamps}
                    minValue={0}
                    maxValue={100}
                />
            </>
        )
    }

export default Earn;