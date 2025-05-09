import { FC } from "react";

const ChevronTripleLeft: FC<{
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
                <path d="M19 6l-5 5l5 5" />
                <path d="M13 6l-5 5l5 5" />
                <path d="M7 6l-5 5l5 5" />
            </svg>
        )
    }

export default ChevronTripleLeft;