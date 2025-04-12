import { FC } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import { OtherUser } from "../../../storage/users/users-types";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";

const Spend: FC<{
    user: OtherUser,
    appConfig: AppConfig,
    spendStamps: (amount: number) => void,
    goHistoryView: (userId: string) => void,
    renderTabs: () => React.ReactNode
}> = ({

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
                    key='stamps'
                    inputLabel="Ile kart wymienić na rabat?"
                    buttonLabel={(submitValue: number) => {
                        return <strong style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "white",
                            justifyContent: "center"
                        }}>
                            Wymień {submitValue}x <Icon iconName={IconName.Gift} color="white" />
                        </strong>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Kwota rabatu: <strong>{submitValue * appConfig.discount}</strong> PLN<br />
                            Pieczątki: <strong>{submitValue * appConfig.cardSize}</strong><br />
                        </span>
                    )}
                    onSubmit={spendStamps}
                    minValue={0}
                    maxValue={appConfig.maxCardsPerTransaction}
                    dynamicButtons={Array.from({ length: appConfig.maxCardsPerTransaction }, (_, i) => i + 1)}
                    currencyIcon={<Icon iconName={IconName.Gift} color="var(--earn-stamp)" width={18} height={18} />}
                />
            </>
        );
    }

export default Spend;