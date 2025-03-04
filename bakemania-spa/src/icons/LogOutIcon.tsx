import { FC } from "react";

const LogOutIcon: FC<{
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
            >
                <path d="M15 12h-12" />
                <path d="M7 8l-4 4l4 4" />
                <path d="M12 21a9 9 0 0 0 0 -18" />
            </svg>
        )
    }

export default LogOutIcon;