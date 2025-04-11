import { FC } from "react"
import UserShort from "../../../atoms/UserShort/UserShort"
import { AppConfig } from "../../../storage/appConfig/appConfig-types"
import { OtherUser } from "../../../storage/users/users-types"
import RichNumberForm from "../../RichNumberForm/RichNumberForm"
import Icon from "../../../icons/Icon"
import IconName from "../../../icons/IconName"

const Earn: FC<{
    cardId: string,
    user: OtherUser,
    appConfig: AppConfig,
    earnStamps: (amount: number) => void,
    goHistoryView: (userId: string) => void,
    renderTabs: () => React.ReactNode
}> = ({
    cardId,
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
                {renderTabs()}
                <RichNumberForm
                    submitClassName='ScanningSectionEarn__button-submit-earn'
                    addClassName='ScanningSectionEarn__button-add'
                    subtractClassName='ScanningSectionEarn__button-remove'
                    key='stamps'
                    inputLabel="Ile pieczątek nabić?"
                    buttonLabel={(submitValue: number) => {
                        return <>
                            <Icon iconName={IconName.Stamp} color="white" />
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

export default Earn;