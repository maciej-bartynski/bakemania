import { FC, PropsWithChildren } from "react";
import './BottomPanel.css';
import Config from "../../config";
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";

type BottomPanelVariant = 'default' | 'danger';

const BottomPanel: FC<PropsWithChildren<{
    show: boolean,
    toggleBottomPanel: () => void,
    title: string,
    variant?: BottomPanelVariant
}>> = ({ show, toggleBottomPanel, title, children, variant = 'default' }) => {
    return (
        <>
            {show && (
                <div
                    className="BottomPanel__overlay"
                    onClick={toggleBottomPanel}
                    style={{
                        opacity: show ? 1 : 0,
                        pointerEvents: show ? 'auto' : 'none'
                    }}
                />
            )}
            <aside
                className={`BottomPanel ${show ? "visible" : "hidden"} BottomPanel--${variant}`}
                style={{
                    paddingBottom: Config.FooterHeight
                }}
            >
                <div className="BottomPanel__header">
                    <span className="BottomPanel__title">
                        {title}
                    </span>
                </div>

                <div className="BottomPanel__content">
                    {children}
                </div>

                <button
                    className="BottomPanel__hide-button"
                    onClick={toggleBottomPanel}
                >
                    <Icon iconName={IconName.ArrowDown} width={16} height={16} />
                    Schowaj
                </button>
            </aside>
        </>
    );
};

export default BottomPanel;
