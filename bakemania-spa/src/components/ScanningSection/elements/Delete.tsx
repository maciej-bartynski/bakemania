import { FC, useState } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import { OtherUser } from "../../../storage/users/users-types";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";
import BottomPanel from "../../../atoms/BottomPanel/BottomPanel";
import OperationIcon from "../../../atoms/OperationIcon/OperationIcon";
import Operations from "../../../tools/operations";
import AppUser from "../../../atoms/AppUser/AppUser";

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

        const [showConfirmationPanelWithAmount, setShowConfirmationPanelWithAmount] = useState(0);

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

                {(user?.stamps.amount ?? 0) > 0 ? (
                    <RichNumberForm
                        key='stamps'
                        inputLabel="Ile pieczątek skasować?"
                        currencyIcon={<Icon iconName={IconName.StampRemove} color="var(--colorActive)" width={18} height={18} />}
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
                        onSubmit={setShowConfirmationPanelWithAmount}
                        minValue={0}
                        maxValue={(user?.stamps.amount ?? 0) > 100 ? 100 : (user?.stamps.amount ?? 0)}
                        rangeMaxValue={(user?.stamps.amount ?? 0) > 100 ? 100 : (user?.stamps.amount ?? 0)}
                    />
                ) : (
                    <span style={{
                        textAlign: "center",
                        padding: "10px",
                    }}>
                        Użytkownik nie ma pieczątek do skasowania
                    </span>
                )}

                <BottomPanel
                    title={(
                        <div className="ScanningSection__updateOverlay-title-stamp-removal">
                            <OperationIcon operation={Operations.StampRemoval} />
                            Usuwanie {showConfirmationPanelWithAmount} {stampsLabelForDeletePanel(showConfirmationPanelWithAmount)}
                        </div>
                    )}
                    show={!!showConfirmationPanelWithAmount}
                    toggleBottomPanel={() => setShowConfirmationPanelWithAmount(0)}
                >
                    <AppUser email={user.email} role={user.role} />
                    <button
                        type="button"
                        className="action-btn"
                        style={{
                            backgroundColor: 'var(--remove-stamp)',
                        }}
                        onClick={async () => {
                            if (showConfirmationPanelWithAmount > 0) {
                                deleteStamps(showConfirmationPanelWithAmount);
                                setShowConfirmationPanelWithAmount(0)
                            } else {
                                setShowConfirmationPanelWithAmount(0);
                            }
                        }}

                    >
                        <Icon iconName={IconName.StampRemove} color="white" />Usuwam {showConfirmationPanelWithAmount}
                    </button>
                </BottomPanel>
            </>
        )
    }

export default Delete;

const stampsLabelForDeletePanel = (amount: number): string => {
    if (amount === 1) {
        return 'pieczątki';
    }

    return 'pieczątek';
}
