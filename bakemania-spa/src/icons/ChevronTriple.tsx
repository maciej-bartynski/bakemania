import { FC } from "react";

const ChevronTriple: FC<{
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
                <path d="M3 6l5 5l-5 5" />
                <path d="M9 6l5 5l-5 5" />
                <path d="M15 6l5 5l-5 5" />
            </svg>
        )
    }

export default ChevronTriple;