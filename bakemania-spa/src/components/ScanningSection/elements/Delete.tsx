import { FC } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import { OtherUser } from "../../../storage/users/users-types";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";

const Delete: FC<{
    user: OtherUser,
    appConfig: AppConfig,
    deleteStamps: (amount: number) => void,
    goHistoryView: (userId: string) => void,
    renderTabs: () => React.ReactNode
}> = ({
    user,
    appConfig,
    deleteStamps,
    goHistoryView,
    renderTabs
}) => {
        const userGiftsAmount = Math.floor((user?.stamps.amount ?? 0) / appConfig.cardSize);

        return (
            <>
                <UserShort
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
                <RichNumberForm
                    key='stamps'
                    inputLabel="Ile pieczątek skasować?"
                    currencyIcon={<Icon iconName={IconName.StampRemove} color="var(--earn-stamp)" width={18} height={18} />}
                    buttonLabel={(submitValue: number) => {
                        return <strong style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "white",
                            justifyContent: "center"
                        }}>
                            Skasuj {submitValue}<Icon iconName={IconName.StampRemove} color="white" />
                        </strong>
                    }}
                    descriptionLabel={(submitValue: number) => (
                        <span>
                            Usuniesz <strong>{submitValue}x</strong> pieczątek
                        </span>
                    )}
                    onSubmit={deleteStamps}
                    minValue={0}
                    maxValue={100}
                />
            </>
        )
    }

export default Delete;
