import { FC, useCallback, useState } from "react";
import AsidePanel from "../../atoms/AsidePanel/AsidePanel";
import FooterNav from "../FooterNav/FooterNav";
import IconName from "../../icons/IconName";
import IconButton from "../../atoms/IconButton/IconButton";
import useAppDispatch from "../../storage/useAppDispatch";
import meActions from "../../storage/me/me-actions";
import './SettingsSection.css';
import PanelViewTemplate from "../../atoms/PanelViewTemplate/PanelViewTemplate";
import BottomPanel from "../../atoms/BottomPanel/BottomPanel";

const SettingsSection: FC<{
    active: boolean;
    toggleActive: () => void;
}> = ({
    active,
    toggleActive
}) => {
        const dispatch = useAppDispatch();

        const [showLogoutPanel, setShowLogoutPanel] = useState(false);
        const [showDestroyPanel, setShowDestroyPanel] = useState(false);

        const toggleLogoutPanel = useCallback(() => {
            setShowDestroyPanel(false)
            setShowLogoutPanel(state => !state);
        }, [])

        const toggleDestroyPanel = useCallback(() => {
            setShowLogoutPanel(false)
            setShowDestroyPanel(state => !state);
        }, [])

        return (
            <AsidePanel
                active={active}
                side="right"
            >
                <PanelViewTemplate
                    title="Ustawienia"
                    appBar={(
                        <>
                            <FooterNav
                                actions={[
                                    {
                                        label: 'Wróć',
                                        action: toggleActive,
                                        icon: IconName.ArrowDown,
                                    }
                                ]}
                            />

                            <BottomPanel
                                title="Chcesz się wylogować?"
                                show={showLogoutPanel}
                                toggleBottomPanel={toggleLogoutPanel}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-around',
                                        gap: 10
                                    }}>

                                    <button
                                        onClick={() => {
                                            dispatch(meActions.logOut());
                                        }}
                                        className="secondary"
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        Tak
                                    </button>

                                    <button
                                        onClick={toggleLogoutPanel}
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        Wróć
                                    </button>

                                </div>
                            </BottomPanel>

                            <BottomPanel
                                title="Ta opcja nie jest dostępna"
                                show={showDestroyPanel}
                                toggleBottomPanel={toggleDestroyPanel}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-around',
                                        gap: 10
                                    }}>

                                    <button
                                        className="secondary"
                                        onClick={() => { }}
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        Tap
                                    </button>

                                    <button
                                        onClick={toggleDestroyPanel}
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        Wróć
                                    </button>

                                </div>
                            </BottomPanel>
                        </>
                    )}
                >
                    <div className="settings-section-field">
                        <IconButton
                            iconName={IconName.LogOut}
                            bgColor="transparent"
                            iconColor="var(--text)"
                            textColor="transparent"
                            label=""
                            onClick={toggleLogoutPanel}
                        />
                        <span>Wyloguj</span>
                    </div>

                    <div
                        className="settings-section-field"
                    >
                        <IconButton
                            iconName={IconName.Destroy}
                            bgColor="transparent"
                            iconColor="red"
                            textColor="red"
                            label=""
                            onClick={toggleDestroyPanel}
                        />
                        <span>Usuń konto</span>
                    </div>
                </PanelViewTemplate>
            </AsidePanel>
        )
    }

export default SettingsSection;