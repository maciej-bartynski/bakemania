import { FC, useState } from "react"
import UserShort from "../../../atoms/UserShort/UserShort"
import { AppConfig } from "../../../storage/appConfig/appConfig-types"
import { OtherUser } from "../../../storage/users/users-types"
import RichNumberForm from "../../RichNumberForm/RichNumberForm"
import Icon from "../../../icons/Icon"
import IconName from "../../../icons/IconName"
import BottomPanel from "../../../atoms/BottomPanel/BottomPanel"
import OperationIcon from "../../../atoms/OperationIcon/OperationIcon"
import Operations from "../../../tools/operations"
import AppUser from "../../../atoms/AppUser/AppUser"

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
        const [showConfirmationPanelWithAmount, setShowConfirmationPanelWithAmount] = useState(0);

        return (
            <>
                <UserShort
                    variant="operations"
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
                    currencyIcon={<Icon iconName={IconName.Stamp} color="var(--colorActive)" width={18} height={18} />}
                    descriptionLabel={(submitValue: number) => (
                        <>
                            Zakupy za <strong>{submitValue * appConfig.discount}.00 PLN</strong> do <strong>{((submitValue + 1) * appConfig.discount) - 0.01} PLN</strong>
                        </>
                    )}
                    onSubmit={setShowConfirmationPanelWithAmount}
                    minValue={0}
                    rangeMaxValue={100}
                />

                <BottomPanel
                    title={(
                        <div className="ScanningSection__updateOverlay-title-stamp-addition">
                            <OperationIcon operation={Operations.StampAddition} />
                            Dodawanie {showConfirmationPanelWithAmount} {stampsLabelForEarnPanel(showConfirmationPanelWithAmount)}
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
                            backgroundColor: 'var(--earn-stamp)',
                        }}
                        onClick={async () => {
                            if (showConfirmationPanelWithAmount > 0) {
                                earnStamps(showConfirmationPanelWithAmount);
                                setShowConfirmationPanelWithAmount(0)
                            } else {
                                setShowConfirmationPanelWithAmount(0);
                            }
                        }}

                    >
                        <Icon iconName={IconName.Stamp} color="white" />Dodaję {showConfirmationPanelWithAmount}
                    </button>
                </BottomPanel>
            </>
        )
    }

export default Earn;

const stampsLabelForEarnPanel = (amount: number): string => {
    if (amount === 1) {
        return 'pieczątki';
    }

    return 'pieczątek';
}
