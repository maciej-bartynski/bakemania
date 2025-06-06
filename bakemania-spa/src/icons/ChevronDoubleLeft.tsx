import { FC } from "react";

const ChevronDoubleLeft: FC<{
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
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M17 18l-6-6l6-6" />
                <path d="M11 18l-6-6l6-6" />
            </svg>
        )
    }

export default ChevronDoubleLeft;