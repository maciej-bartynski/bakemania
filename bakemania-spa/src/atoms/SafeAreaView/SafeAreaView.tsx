import { FC, PropsWithChildren, useEffect, useState } from "react";

const SafeAreaView: FC<PropsWithChildren> = ({
    children,
}) => {

    const [safeHeight, setSafeHeight] = useState(window.innerHeight);
    const [safeWidth, setSafeWidth] = useState(window.innerWidth);

    useEffect(() => {
        function onResize(): void {
            setSafeHeight(window.innerHeight);
            setSafeWidth(window.innerWidth);
        }

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        }
    }, []);

    return (
        <div
            className="SafeAreaView"
            style={{
                height: safeHeight,
                width: safeWidth,
                boxSizing: 'border-box',
            }}
        >
            {children}
        </div>
    )
}

export default SafeAreaView;