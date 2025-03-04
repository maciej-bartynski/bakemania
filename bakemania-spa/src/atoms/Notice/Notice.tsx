import { FC, PropsWithChildren } from "react";
import './Notice.css';

const Notice: FC<PropsWithChildren<{
    onClick?: () => void,
    className?: string,
    style?: React.CSSProperties,
}>> = ({
    children,
    onClick,
    className,
    style
}) => {
        return (
            <button
                type="button"
                className={`notice ${className}`}
                onClick={onClick}
                style={style}
            >
                <span>
                    {children}
                </span>
            </button>
        )
    }

export default Notice;