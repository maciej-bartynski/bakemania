import { FC } from "react";

const MobileDownload: FC<{
    width?: number;
    height?: number;
    color?: string;
}> = ({
    width = 24,
    height = 24,
    color = 'var(--text)'
}) => {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v7" />
                <path d="M11 4h2" />
                <path d="M12 17v.01" />
                <path d="M19 16v6" />
                <path d="M22 19l-3 3l-3 -3" />
            </svg>
        )
    }

export default MobileDownload;