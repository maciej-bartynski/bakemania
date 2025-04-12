import { FC, ReactNode } from "react";
import Stamp from "../Stamp/Stamp";
import iterateIcons from "../Stamp/Stamp.helper";
import './UpdateOverlay.css';

const UpdateOverlay: FC<{
    updated: boolean;
    title: ReactNode,
    message: ReactNode,
    timeout: number,
    onClose: () => void,
    variant: 'success' | 'error'
}> = ({
    updated,
    title = 'Aiwm!!',
    message = 'Aiwm-Aiwm-Aiwm',
    timeout,
    onClose: onClose,
    variant = 'success'
}) => {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: "0%",
                    left: "0%",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                    ...(updated ? {
                        width: '100%',
                        height: '100%',
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
                <div style={{
                    position: 'fixed',
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    maxWidth: "70vw",
                    maxHeight: "50vh",
                    borderRadius: "10px",
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    ...(updated ? {
                        width: '100%',
                        height: '100%',
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
                }}>
                    <span>

                        <Stamp stampConfig={iterateIcons(3)[2]} />
                    </span>
                    <br />
                    <div style={{
                        textAlign: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: variant === 'success' ? 'var(--bakemaniaGold)' : 'red',
                    }}>
                        {title}
                    </div>
                    <div style={{
                        textAlign: 'center',
                        fontSize: '16px',
                    }}>
                        {message}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: 'var(--bakemaniaGold)',
                            borderColor: 'var(--bakemaniaGold)',
                            color: 'white',
                            padding: '10px 20px',
                        }}
                    >
                        Rozumiem
                    </button>
                </div>
            </div>
        )
    }

export default UpdateOverlay;