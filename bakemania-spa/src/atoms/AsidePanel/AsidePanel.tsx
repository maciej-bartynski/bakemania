import { FC, PropsWithChildren } from "react";
import './AsidePanel.css';

const AsidePanel: FC<PropsWithChildren<{
    active: boolean,
    side?: 'left' | 'right' | 'top' | 'bottom'
}>> = ({
    active,
    side = 'left',
    children
}) => {
        return (
            <div
                className={"aside-panel"}
                style={{
                    [side]: active ? '0' : 'calc(100% + 20px)',
                    transition: `${side} 250ms ease-in-out`
                }}
            >
                {children}
            </div>
        )
    }

export default AsidePanel;