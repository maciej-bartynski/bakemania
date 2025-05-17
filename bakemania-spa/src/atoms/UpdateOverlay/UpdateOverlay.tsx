import { FC, ReactNode, useRef } from "react";
import './UpdateOverlay.css';
import Icon from "../../icons/Icon";
import IconName from "../../icons/IconName";
import UserIcon from "../../icons/UserIcon";

const UpdateOverlay: FC<{
    title: ReactNode,
    message: ReactNode,
    onPrimaryAction: () => void,
    onSecondaryAction: () => void,
    icon: ReactNode,
    onWarningAction?: () => void
}> = ({
    title,
    message,
    onPrimaryAction,
    onSecondaryAction,
    icon,
    onWarningAction
}) => {
        const ref = useRef<HTMLDivElement>(null);

        const _onPrimaryAction = () => {
            ref.current?.classList.add('--reverse-animation');
            onPrimaryAction();
        }

        const _onSecondaryAction = () => {
            ref.current?.classList.add('--reverse-animation');
            onSecondaryAction();
        }

        return (
            <div className="UpdateOverlay" ref={ref}>
                <div className='UpdateOverlay__modal'>
                    <div className='UpdateOverlay__header'>
                        {icon}
                    </div>
                    <div className='UpdateOverlay__body'>
                        {title && (
                            <div style={{
                                textAlign: 'center',
                                fontSize: '20px',
                                fontWeight: 'bold',
                            }}>
                                {title}
                            </div>
                        )}
                        <div style={{
                            textAlign: 'center',
                            fontSize: '16px',
                        }}>
                            {message}
                        </div>

                    </div>
                    <div className='UpdateOverlay__footer'>
                        {onWarningAction ? (
                            <button
                                onClick={onWarningAction}
                                style={{
                                    backgroundColor: 'var(--warning)',
                                    border: 'none',
                                }}
                            >
                                Rozumiem
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={_onSecondaryAction}
                                    className="secondary"
                                >
                                    <Icon iconName={IconName.ArrowDown} />
                                    Główna
                                </button>

                                <button
                                    onClick={_onPrimaryAction}
                                >
                                    <UserIcon.Customer color="white" />
                                    Konto klienta
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }

export default UpdateOverlay;