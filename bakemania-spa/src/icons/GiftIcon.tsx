import { FC } from "react";

const GiftIcon: FC<{
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
                viewBox={`0 0 24 24`}
                fill="none"
                stroke={color}
            >
                <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" />
                <path d="M12 8l0 13" />
                <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7" />
                <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5" />
            </svg>
        )
    }

export default GiftIcon;