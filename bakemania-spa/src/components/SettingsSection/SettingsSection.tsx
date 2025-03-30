import { FC, useCallback, useState } from "react";
import AsidePanel from "../../atoms/AsidePanel/AsidePanel";
import FooterNav from "../FooterNav/FooterNav";
import IconName from "../../icons/IconName";
import IconButton from "../../atoms/IconButton/IconButton";
import './SettingsSection.css';
import PanelViewTemplate from "../../atoms/PanelViewTemplate/PanelViewTemplate";
import BottomPanel from "../../atoms/BottomPanel/BottomPanel";
import clearSession from "../../tools/clearSession";
import apiService from "../../services/ApiService";
import Config from "../../config";

const SettingsSection: FC<{
    active: boolean;
    toggleActive: () => void;
}> = ({
    active,
    toggleActive
}) => {
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
                                            clearSession();
                                            window.location.reload();
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
                                title="Usuwanie konta - ta opcja jest nieodwracalna"
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
                                        type="button"
                                        className="secondary"
                                        onClick={() => {
                                            apiService.fetch('/user/remove-account', {
                                                method: 'DELETE',
                                                headers: {
                                                    'Authorization': `Bearer ${window.localStorage.getItem(Config.sessionKeys.Token)}`
                                                }
                                            }, [204]).then(() => {
                                                clearSession();
                                                window.location.reload();
                                            }).catch((e) => {
                                                alert('Nie udało się usunąć konta');
                                                alert(e);
                                            });
                                        }}
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        Usuwam konto!
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