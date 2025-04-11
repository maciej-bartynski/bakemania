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
    spendStamps: (amount: number) => void,
    goHistoryView: (userId: string) => void,
    renderTabs: () => React.ReactNode
}> = ({
    cardId,
    user,
    appConfig,
    spendStamps,
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
                    submitClassName='ScanningSectionSpend__button-submit-spend'
                    addClassName='ScanningSectionSpend__button-add'
                    subtractClassName='ScanningSectionSpend__button-remove'
                    key='stamps'
                    inputLabel="Ile pieczątek wymienić?"
                    buttonLabel={(submitValue: number) => {
                        return <>
                            <Icon iconName={IconName.Gift} color="white" />
                            Wymień {submitValue}
                        </>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Kwota rabatu:<br />
                            - od <strong>{submitValue * appConfig.cardSize}.00 PLN</strong><br />
                            - do <strong>{((submitValue + 1) * appConfig.cardSize) - 0.01} PLN</strong>
                        </span>
                    )}
                    onSubmit={spendStamps}
                    minValue={1}
                    maxValue={100}
                />
            </>
        );
    }

export default Spend;