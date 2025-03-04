import { FC, PropsWithChildren } from "react";
import './BottomPanel.css';
import Config from "../../config";

const BottomPanel: FC<PropsWithChildren<{
    show: boolean,
    toggleBottomPanel: () => void,
    title: string,

}>> = ({ show, toggleBottomPanel, title, children }) => {
    return (
        <>
            {show && (
                <div className="BottomPanel__overlay" onClick={toggleBottomPanel} />
            )}
            <aside
                className={`BottomPanel ${show ? "visible" : "hidden"}`}
                style={{
                    paddingBottom: Config.FooterHeight
                }}
            >
                <span className="BottomPanel__title">
                    {title}
                </span>

                <div className="BottomPanel__content">
                    {children}
                </div>
                <button className="BottomPanel__hide-button" onClick={toggleBottomPanel}>
                    Schowaj
                </button>
            </aside>
        </>
    );
};

export default BottomPanel;
