import { FC, useCallback, useEffect, useState } from 'react';
import './DiscountSection.css';
import DiscountCard from '../../atoms/DiscountCard/DiscountCard';
import FooterNav, { NavAction } from '../FooterNav/FooterNav';
import IconName from '../../icons/IconName';
import QrBottomPanel from '../../atoms/QrBottomPanel/QrBottomPanel';
import useMeSelector from '../../storage/me/me-selectors';
import useAppConfigSelector from '../../storage/appConfig/appConfig-selectors';
import AsidePanel from '../../atoms/AsidePanel/AsidePanel';
import { useLiveUpdateContext } from '../../LiveUpdate/LiveUpdateContext';
import PanelViewTemplate from '../../atoms/PanelViewTemplate/PanelViewTemplate';

const DiscountSection: FC<{
    active: boolean;
    toggleActive: () => void;
}> = ({
    active,
    toggleActive,
}) => {

        const { stampsUpdated } = useLiveUpdateContext();

        const { me } = useMeSelector();
        const { appConfig } = useAppConfigSelector();
        const [showGiftQr, setShowGiftQr] = useState(false);
        const toggleGiftQr = useCallback(() => {
            setShowGiftQr(state => !state);
        }, []);

        useEffect(() => {
            if (!stampsUpdated) {
                setShowGiftQr(false);
            }
        }, [stampsUpdated])

        if (!me || !appConfig) {
            return null;
        }

        const stampsAmount = me.stamps.amount;
        const stampsInCard = appConfig?.cardSize ?? 7;
        const totalGiftCardAmount = Math.floor(stampsAmount / stampsInCard);

        return (
            <AsidePanel
                side='left'
                active={active}
            >
                <PanelViewTemplate
                    title='Twoje nagrody'
                    appBar={(
                        <>
                            <FooterNav
                                actions={[
                                    {
                                        label: 'Wróć',
                                        action: toggleActive,
                                        icon: IconName.ArrowDown,
                                    },
                                    {
                                        label: 'Odbierz rabat',
                                        action: toggleGiftQr,
                                        icon: IconName.Discount,
                                        variant: 'primary'
                                    },
                                ].filter(actions => {
                                    if (actions.label === 'Odbierz rabat') {
                                        if (totalGiftCardAmount > 0) {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    }

                                    return true;
                                }) as NavAction[]}
                            />
                            <QrBottomPanel
                                userId={me._id}
                                variant="spend"
                                show={showGiftQr}
                                toggleBottomPanel={toggleGiftQr}
                            />
                        </>
                    )}
                >
                    <div className="discount-section">
                        {(totalGiftCardAmount > 0) ? (
                            <div className="discount-section__content">
                                <div className="discount-section__track">
                                    <div className="stamps-container">
                                        {Array.from({ length: totalGiftCardAmount }, (_, index) => (
                                            <DiscountCard
                                                key={index}
                                                onClick={toggleGiftQr}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="discount-section__message">
                                    Twoje nagrody <span>({totalGiftCardAmount})</span>
                                </p>
                            </div>
                        ) : (
                            <div className="discount-section__no-gifts">
                                <p className="discount-section__message">
                                    <strong>
                                        Jeszcze nie masz nagród
                                    </strong>
                                </p>
                                <DiscountCard
                                    onClick={toggleGiftQr}
                                    disabled
                                />
                                <span>
                                    Za każde zebrane {appConfig?.cardSize ?? 7} pieczątek<br />
                                    pojawi się tu karta rabatowa<br />
                                    na kwotę {appConfig.discount ?? 15} zł.<br />
                                </span>
                            </div>
                        )}
                    </div>
                </PanelViewTemplate>
            </AsidePanel>
        );
    };

export default DiscountSection;