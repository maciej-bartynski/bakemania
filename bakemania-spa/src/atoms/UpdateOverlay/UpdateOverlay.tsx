import { FC } from "react";
import Stamp from "../Stamp/Stamp";
import iterateIcons from "../Stamp/Stamp.helper";
import './UpdateOverlay.css';

const UpdateOverlay: FC<{
    updated: boolean;
    title: string,
    message: string,
    timeout: number
}> = ({
    updated,
    title,
    message,
    timeout
}) => {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    ...(updated ? {
                        width: undefined,
                        height: undefined,
                        animation: `ping-animation ${timeout}ms linear`,
                        right: 0,
                        bottom: 0,
                    } : {
                        width: 0,
                        height: 0,
                        animation: undefined,
                        right: undefined,
                        bottom: undefined,
                    }),

                }}
            >
                <span>
                    <Stamp stampConfig={iterateIcons(1)[0]} />
                    <Stamp stampConfig={iterateIcons(7)[3]} />
                    <Stamp stampConfig={iterateIcons(3)[2]} />
                </span>
                <br />
                <div>
                    {title}
                </div>
                <div>
                    {message}
                </div>
            </div>
        )
    }

export default UpdateOverlay;