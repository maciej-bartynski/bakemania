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
                    variant="operations"
                    hideId={true}
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
                {userGiftsAmount > 0 ? (
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
                            <>
                                Rabat <strong>{submitValue * appConfig.discount} PLN</strong> za{' '}
                                <strong>{submitValue * appConfig.cardSize}</strong> pieczątki (<strong>{submitValue} kart</strong>)
                            </>
                        )}
                        onSubmit={(submitValue) => {
                            const stampsAmount = submitValue * appConfig.cardSize;
                            spendStamps(stampsAmount);
                        }}
                        minValue={0}
                        maxValue={userGiftsAmount > appConfig.maxCardsPerTransaction ? appConfig.maxCardsPerTransaction : userGiftsAmount}
                        rangeMaxValue={userGiftsAmount > appConfig.maxCardsPerTransaction ? appConfig.maxCardsPerTransaction : userGiftsAmount}
                        currencyIcon={<Icon iconName={IconName.Gift} color="var(--colorActive)" width={18} height={18} />}
                    />
                ) : (
                    <span style={{
                        textAlign: "center",
                        padding: "10px",
                    }}>
                        Użytkownik nie ma kart do wymiany
                    </span>
                )}
            </>
        );
    }

export default Spend;