import { FC, useRef } from "react";
import './Stamp.css'
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";

const Stamp: FC<{
    stampConfig?: {
        iconName: IconName;
        angle: number;
        marginLeft: number;
        marginTop: number;
    }
}> = ({
    stampConfig
}) => {

        const randomAngle = useRef(stampConfig?.angle ?? Math.round(Math.random() * 360)).current;
        const randomMarginLeft = useRef(stampConfig?.marginLeft ?? Math.round(Math.random() * 5)).current;
        const randomMarginTop = useRef(stampConfig?.marginTop ?? Math.round(Math.random() * 5)).current;
        const index = Math.round((Math.random() * 3));
        const randomIcon: IconName = stampConfig?.iconName ?? [IconName.Cookie, IconName.CookieFill, IconName.CookieMan, IconName.CookieManFill][index];
        return (
            <div
                className="stamp"
                style={{
                    paddingTop: randomMarginTop,
                    paddingLeft: randomMarginLeft
                }}
            >
                <span
                    style={{
                        transform: `rotate(${randomAngle}deg)`,
                    }}
                >
                    <Icon
                        iconName={randomIcon}
                    />
                </span>
            </div>
        )
    }

export default Stamp;