import { FC, useCallback, useState } from "react";
import AsidePanel from "../../atoms/AsidePanel/AsidePanel";
import FooterNav from "../FooterNav/FooterNav";
import IconName from "../../icons/IconName";
import './SettingsSection.css';
import PanelViewTemplate from "../../atoms/PanelViewTemplate/PanelViewTemplate";
import BottomPanel from "../../atoms/BottomPanel/BottomPanel";
import clearSession from "../../tools/clearSession";
import apiService from "../../services/ApiService";
import Icon from "../../icons/Icon";

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
                                            apiService.fetch('user/remove-account', {
                                                method: 'DELETE',
                                            }, [204]).then(() => {
                                                clearSession();
                                                window.location.reload();
                                            }).catch(() => {
                                                alert('Nie udało się usunąć konta');
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
                        <button
                            className="settings-section-field__settings-button"
                            onClick={toggleLogoutPanel}
                        >
                            <Icon
                                iconName={IconName.LogOut}
                                color="var(--text)"
                            />

                            <span>
                                Wyloguj
                            </span>
                        </button>
                    </div>

                    <div className="settings-section-field">
                        <button
                            className="settings-section-field__settings-button"
                            onClick={toggleDestroyPanel}
                        >
                            <Icon
                                iconName={IconName.Destroy}
                                color="red"
                            />

                            <span style={{ color: 'red' }}>
                                Usuń konto
                            </span>
                        </button>
                    </div>


                </PanelViewTemplate>
            </AsidePanel>
        )
    }

export default SettingsSection;