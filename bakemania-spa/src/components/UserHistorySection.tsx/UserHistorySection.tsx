import { FC, useEffect, useState } from "react";
import { OtherUser } from "../../storage/users/users-types";
import AsidePanel from "../../atoms/AsidePanel/AsidePanel";
import PanelViewTemplate from "../../atoms/PanelViewTemplate/PanelViewTemplate";
import FooterNav from "../FooterNav/FooterNav";
import IconButton from "../../atoms/IconButton/IconButton";
import IconName from "../../icons/IconName";
import apiService from "../../services/ApiService";
import './UserHistorySection.css';
import Icon from "../../icons/Icon";
import useAppConfigSelector from "../../storage/appConfig/appConfig-selectors";
import UserShort from "../../atoms/UserShort/UserShort";


const UserHistorySection: FC<{
    active: boolean,
    toggleActive: () => void,
    details: {
        userId: string,
    } | null,
    toggleCardDetailsView: (details: {
        userId: string,
        variant: 'spend' | 'earn',
        assistantId: string,
        cardId: string,
    }) => void,
}> = ({ active, details, toggleActive, toggleCardDetailsView }) => {

    const [user, setUser] = useState<OtherUser | null>(null);
    const { appConfig } = useAppConfigSelector();

    useEffect(() => {
        const fetchUser = async () => {
            if (active && details?.userId) {
                const user = await apiService.fetch(`user/${details?.userId}`) as OtherUser;
                setUser(user ?? null);
            }
        }
        fetchUser();
    }, [active, details?.userId]);



    if (!appConfig || !user) {
        return 'Ładowanie konfiguracji...';
    }

    const userGiftsAmount = Math.floor(user?.stamps.amount / appConfig.cardSize);
    return (
        <AsidePanel
            side='left'
            active={active}
        >
            <PanelViewTemplate
                title={<><Icon iconName={IconName.History} color='white' />Historia użytkownika</>}
                appBarClassName={`HistorySection__app-bar`}
                appBar={(
                    <>
                        <FooterNav>
                            <IconButton
                                iconColor='white'
                                bgColor='var(--text)'
                                onClick={toggleActive}
                                label='Wróć'
                                iconName={IconName.ArrowDown}
                            />
                        </FooterNav>
                    </>
                )}
            >
                <div className="HistorySection">

                    <UserShort
                        userId={user._id}
                        userEmail={user?.email}
                        userStampsAmount={user?.stamps.amount}
                        userGiftsAmount={userGiftsAmount}
                        userCard={user?.card}
                        isVerified={user?.verification.isVerified}
                        isAgreements={user?.agreements}
                        actionButton={
                            <button
                                className='secondary'
                                style={{
                                    height: 28,
                                    borderColor: 'var(--customer)',
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 5,
                                    color: 'var(--customer)',
                                    fontWeight: 400
                                }}
                                onClick={() => {
                                    toggleCardDetailsView({
                                        userId: user._id,
                                        variant: 'spend',
                                        assistantId: '',
                                        cardId: 'change-force',

                                    })
                                }}
                            >
                                <Icon iconName={IconName.QrCode} color='var(--customer)' width={16} height={16} /> Idź do karty
                            </button>
                        }
                    />
                    {user?.stamps.history.map(entry => {
                        const infoElement = (
                            <div className="HistorySection__stamp-entry__info">
                                <span>Zmiana: <strong>{entry.by}</strong></span>
                                <span>Saldo po operacji: <strong>{entry.balance}</strong></span>
                                <span>Data: <strong>{entry.createdAt}</strong></span>
                                <span>Sprzedawca: <strong>{entry.assistantId}</strong></span>
                            </div>
                        )

                        if (entry.by > 0) {
                            // zarobil
                            return (
                                <div
                                    className="HistorySection__stamp-entry --earn"
                                    key={entry._id}
                                >
                                    <div className="HistorySection__stamp-entry__icon-container --earn">
                                        <Icon iconName={IconName.Stamp} color='white' width={16} height={16} /> Nabito pieczątki
                                    </div>
                                    {infoElement}
                                </div>
                            )
                        } else {
                            // stracił
                            if (+entry.by % appConfig.cardSize === 0) {
                                return (
                                    <div
                                        className="HistorySection__stamp-entry --spend"
                                        key={entry._id}

                                    >
                                        <div className="HistorySection__stamp-entry__icon-container --spend">
                                            <Icon iconName={IconName.Gift} color='white' width={16} height={16} /> Skorzystano z rabatu
                                        </div>
                                        {infoElement}
                                    </div>
                                )
                            } else {
                                return (
                                    <div
                                        className="HistorySection__stamp-entry --remove"
                                        key={entry._id}

                                    >
                                        <div className="HistorySection__stamp-entry__icon-container --remove">
                                            <Icon iconName={IconName.StampRemove} color='white' width={16} height={16} /> Usunięto pieczątki
                                        </div>
                                        {infoElement}
                                    </div>
                                )
                            }
                        }


                    })}
                </div>
            </PanelViewTemplate>
        </AsidePanel>
    );
}

export default UserHistorySection;