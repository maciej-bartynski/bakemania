import { FC, useState } from "react";
import UserShort from "../../../atoms/UserShort/UserShort";
import RichNumberForm from "../../RichNumberForm/RichNumberForm";
import { OtherUser } from "../../../storage/users/users-types";
import { AppConfig } from "../../../storage/appConfig/appConfig-types";
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";
import BottomPanel from "../../../atoms/BottomPanel/BottomPanel";
import OperationIcon from "../../../atoms/OperationIcon/OperationIcon";
import Operations from "../../../tools/operations";
import AppUser from "../../../atoms/AppUser/AppUser";

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
                            setShowConfirmationPanelWithAmount(stampsAmount);
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

                <BottomPanel
                    title={(
                        <div className="ScanningSection__updateOverlay-title-gift">
                            <OperationIcon operation={Operations.GiftExchange} />
                            Wymiana {showConfirmationPanelWithAmount / appConfig.cardSize} {giftLabelForSpendPanel(showConfirmationPanelWithAmount / appConfig.cardSize)}
                        </div>
                    )}
                    show={!!showConfirmationPanelWithAmount}
                    toggleBottomPanel={() => setShowConfirmationPanelWithAmount(0)}
                >
                    <span style={{ alignSelf: 'center' }} >
                        na rabat <strong>{(showConfirmationPanelWithAmount / appConfig.cardSize) * appConfig.discount} PLN</strong>
                    </span>
                    <AppUser email={user.email} role={user.role} />
                    <button
                        type="button"
                        className="action-btn"
                        style={{
                            backgroundColor: 'var(--bakemaniaGold)',
                        }}
                        onClick={async () => {
                            if (showConfirmationPanelWithAmount > 0) {
                                spendStamps(showConfirmationPanelWithAmount);
                                setShowConfirmationPanelWithAmount(0)
                            } else {
                                setShowConfirmationPanelWithAmount(0);
                            }
                        }}

                    >
                        <Icon iconName={IconName.Gift} color="white" />Wymieniam {(showConfirmationPanelWithAmount / appConfig.cardSize)}
                    </button>
                </BottomPanel >
            </>
        );
    }

export default Spend;


const giftLabelForSpendPanel = (amount: number): string => {
    if (amount === 1) {
        return 'karty';
    }

    return 'kart';
}
