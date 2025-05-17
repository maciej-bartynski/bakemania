import { FC, useState } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import { OtherUser } from "../../../storage/users/users-types";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";
import BottomPanel from "../../../atoms/BottomPanel/BottomPanel";
import OperationIcon from "../../../atoms/OperationIcon/OperationIcon";
import Operations from "../../../tools/operations";
import AppUser from "../../../atoms/AppUser/AppUser";

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
                <RichNumberForm
                    currencyIcon={<span className="ScanningSection__pln-icon">PLN</span>}
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
                        <>
                            <strong>{Math.floor(submitValue / appConfig.discount)}</strong> pieczątki za{' '}
                            <strong>{Math.floor(submitValue / appConfig.discount) * appConfig.discount}.00</strong> do{' '}
                            <strong>{(Math.floor(submitValue / appConfig.discount) * appConfig.discount + appConfig.discount) - 0.01} PLN</strong>
                        </>
                    )}
                    onSubmit={(submitValue: number) => {
                        const stampsAmount = Math.floor(submitValue / appConfig.discount);
                        if (stampsAmount > 0) {
                            setShowConfirmationPanelWithAmount(stampsAmount)
                        }
                    }}
                    minValue={0}
                    rangeMaxValue={500}
                    step={10}
                />

                <BottomPanel
                    title={(
                        <div className="ScanningSection__updateOverlay-title-stamp-addition">
                            <OperationIcon operation={Operations.StampAddition} />
                            Dodawanie {showConfirmationPanelWithAmount} {stampsLabelForEarnForAmountPanel(showConfirmationPanelWithAmount)}
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
                                earnStamps(showConfirmationPanelWithAmount)
                                setShowConfirmationPanelWithAmount(0)
                            } else {
                                setShowConfirmationPanelWithAmount(0);
                            }
                        }}

                    >
                        <Icon iconName={IconName.StampForCash} color="white" />Dodaję {showConfirmationPanelWithAmount}
                    </button>
                </BottomPanel>
            </>
        )
    }

export default EarnForAmount;

const stampsLabelForEarnForAmountPanel = (amount: number): string => {
    if (amount === 1) {
        return 'pieczątki';
    }

    return 'pieczątek';
}
