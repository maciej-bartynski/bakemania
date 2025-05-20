import { FC, useCallback, useEffect, useState } from 'react';
import './ManageSection.css';
import FooterNav from '../FooterNav/FooterNav';
import IconName from '../../icons/IconName';
import useMeSelector from '../../storage/me/me-selectors';
import useAppConfigSelector from '../../storage/appConfig/appConfig-selectors';
import AsidePanel from '../../atoms/AsidePanel/AsidePanel';
import PanelViewTemplate from '../../atoms/PanelViewTemplate/PanelViewTemplate';
import { AppConfig } from '../../storage/appConfig/appConfig-types';
import apiService from '../../services/ApiService';
import useAppDispatch from '../../storage/useAppDispatch';
import appConfigActions from '../../storage/appConfig/appConfig-actions';
import ReducerState from '../../storage/types';
import useAssistantsSelector from '../../storage/assistants/users-selectors';
import assistantsActions from '../../storage/assistants/assistants-actions';
import usersActions from '../../storage/users/users-actions';
import UserIcon from '../../icons/UserIcon';
import Pagination from '../../atoms/Pagination/Pagination';
import ManagerItem from './elements/ManagerItem';
import UsersList from '../UsersSection/elements/UsersList';
import BottomPanel from '../../atoms/BottomPanel/BottomPanel';
import { OtherUser } from '../../storage/users/users-types';
import useUsersSelector from '../../storage/users/users-selectors';
import useAppNavigation from '../../tools/useAppNavigation';
import Config from '../../config';
import { noticesStore } from '../../storage/notices-store';
import noticesSlice from '../../storage/notices/notices-reducer';
import * as uuid from 'uuid';

const ManageSection: FC = () => {
    const { setHomeRoute } = useAppNavigation();
    const { me } = useMeSelector();
    const { appConfig, status } = useAppConfigSelector();
    const [active, setActive] = useState(false);
    useEffect(() => {
        if (!me || !appConfig) {
            setActive(false);
            return;
        }
        setActive(true);
    }, [me, appConfig]);


    const [isSaving, setIsSaving] = useState(false);

    const { assistants, hasMore, page, size } = useAssistantsSelector();
    const [appConfigForm, setAppConfigForm] = useState<AppConfig | null>(appConfig);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (appConfig) {
            setAppConfigForm(appConfig);
        }
    }, [appConfig, active, dispatch]);

    useEffect(() => {
        if (active) {
            dispatch(assistantsActions.fetchAssistants({ page: 1, size: 10 }));
        }
    }, [active, dispatch]);

    useEffect(() => {
        if (active) {
            dispatch(usersActions.fetchUsers({ page: 1, size: 10 }));
        }
    }, [active, dispatch]);

    const [selectedCustomer, setSelectedCustomer] = useState<OtherUser | null>(null);
    const [customerPanelBlocked, setCustomerPanelBlocked] = useState<boolean>(false);
    const { page: foundUsersPage, size: foundUsersSize, email } = useUsersSelector();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showRestorePanel, setShowRestorePanel] = useState(false);
    const [restoreConfirmation, setRestoreConfirmation] = useState('');
    const [showBackupPanel, setShowBackupPanel] = useState(false);
    const [showFileRestorePanel, setShowFileRestorePanel] = useState(false);
    const [dbCopyExists, setDbCopyExists] = useState(false);
    const [showRemovePanel, setShowRemovePanel] = useState(false);
    const [showFlushLogsPanel, setShowFlushLogsPanel] = useState(false);
    const [isFlushingLogs, setIsFlushingLogs] = useState(false);

    const checkDbCopy = useCallback(async () => {
        try {
            const response = await apiService.fetch('admin/db-copy/confirm-exists', {
                method: 'GET',
            });
            setDbCopyExists(response.exists);
        } catch {
            setDbCopyExists(false);
        }
    }, [])

    useEffect(() => {
        if (active) {
            checkDbCopy();
        }
    }, [active, checkDbCopy]);

    const handleFlushLogs = async () => {
        setIsFlushingLogs(true);

        try {
            const response = await apiService.fetch('admin/flush-logs', {
                method: 'DELETE'
            });

            if (response.success) {
                alert('Logi zostały wyczyszczone.');
                setShowFlushLogsPanel(false);
            } else {
                noticesStore.dispatch(noticesSlice.actions.addNotice({
                    _id: uuid.v4(),
                    header: 'Nie udało się wyczyścić logów.',
                    body: response.message,
                }));
            }
        } catch (error) {
            noticesStore.dispatch(noticesSlice.actions.addNotice({
                _id: uuid.v4(),
                header: 'Nieokreślony błąd',
                body: `Wystąpił błąd podczas czyszczenia logów. ${error}`,
            }));
        } finally {
            setIsFlushingLogs(false);
        }
    };

    return (
        <AsidePanel
            side='right'
            active={active}
        >
            <PanelViewTemplate
                title={<><UserIcon.Admin color='white' />Zarządzaj systemem</>}
                appBarClassName='ManageSection__app-bar'
                appBar={(
                    <>
                        <FooterNav
                            actions={[
                                {
                                    label: 'Wróć',
                                    action: () => setHomeRoute({ delay: 250, beforeNavigate: () => setActive(false) }),
                                    icon: IconName.ArrowDown,
                                },
                            ]}
                        />
                    </>
                )}
            >
                {isSaving || !me || !appConfig || status !== ReducerState.Idle ? (
                    <div className="global-loader-wrapper">
                        <div className={`global-loader-spinner --active`} />
                    </div>
                ) :
                    (
                        <>
                            <UsersList
                                userActions={[{
                                    label: 'Zatrudnij',
                                    action: setSelectedCustomer,
                                    iconElement: <UserIcon.Promote color="var(--manager)" />
                                }]}
                                headerElement={(
                                    <div className='manage-section-form__header --customer'>
                                        <UserIcon.Customer />
                                        <strong>Klienci bakeMAnii</strong>
                                        <span>
                                            Znajdź <UserIcon.Customer width={12} height={12} color='var(--text)' /> klienta
                                            i nadaj mu <UserIcon.Promote width={12} height={12} color='var(--text)' /> uprawnienia pracownika.
                                        </span>
                                    </div>
                                )}
                            />

                            <div className='manage-section-form'>
                                <div className='manage-section-form__header --manager'>
                                    <UserIcon.Manager />
                                    <strong>Pracownicy bakeMAnii</strong>
                                    <span>
                                        Znajdź <UserIcon.Manager width={12} height={12} color='var(--text)' /> pracownika
                                        i odbierz mu <UserIcon.Downgrade width={12} height={12} color='var(--text)' /> uprawnienia.
                                    </span>
                                </div>

                                {assistants.map((manager) => (
                                    <>
                                        <ManagerItem
                                            manager={manager}
                                            key={manager._id}
                                        />

                                    </>
                                ))}
                                <Pagination
                                    page={page}
                                    size={size}
                                    hasMore={hasMore}
                                    onPageChange={async (nextPage) => {
                                        await dispatch(assistantsActions.fetchAssistants({ page: page + nextPage, size }));
                                    }}
                                />
                            </div>
                            <form
                                className='manage-section-form'
                                onSubmit={async (e) => {
                                    setIsSaving(true);
                                    e.preventDefault();
                                    await apiService.fetch('admin/app-config', {
                                        method: 'PATCH',
                                        body: JSON.stringify({
                                            config: {
                                                cardSize: appConfigForm?.cardSize,
                                                discount: appConfigForm?.discount,
                                                stampsInRow: appConfigForm?.stampsInRow,
                                                maxCardsPerTransaction: appConfigForm?.maxCardsPerTransaction
                                            }
                                        })
                                    });
                                    await dispatch(appConfigActions.getAppConfig());
                                    alert('Konfiguracja zapisana.');
                                    setIsSaving(false);
                                }}
                            >
                                <div className='manage-section-form__header --admin'>
                                    <UserIcon.Admin />
                                    <strong>Konfiguracja systemu</strong>
                                    <span>
                                        Użyj pól poniżej, żeby edytować konfigurację systemu.
                                    </span>
                                </div>

                                <br />
                                <span>Liczba pieczątek na karcie:</span>
                                <input
                                    type="number"
                                    value={appConfigForm?.cardSize}
                                    onChange={(e) => {
                                        if (appConfigForm) {
                                            setAppConfigForm({ ...appConfigForm, cardSize: parseInt(e.target.value) });
                                        }
                                    }}
                                />
                                <span>Wysokość rabatu za kartę:</span>
                                <input
                                    type="number"
                                    value={appConfigForm?.discount}
                                    onChange={(e) => {
                                        if (appConfigForm) {
                                            setAppConfigForm({ ...appConfigForm, discount: parseInt(e.target.value) });
                                        }
                                    }}
                                />
                                <span>Liczba pieczątek wyświetlanych w rzędzie:</span>
                                <input
                                    type="number"
                                    value={appConfigForm?.stampsInRow}
                                    onChange={(e) => {
                                        if (appConfigForm) {
                                            setAppConfigForm({ ...appConfigForm, stampsInRow: parseInt(e.target.value) });
                                        }
                                    }}
                                />
                                <span>Maksymalna liczba kart w jednej transakcji:</span>
                                <input
                                    type="number"
                                    value={appConfigForm?.maxCardsPerTransaction}
                                    onChange={(e) => {
                                        if (appConfigForm) {
                                            setAppConfigForm({ ...appConfigForm, maxCardsPerTransaction: parseInt(e.target.value) });
                                        }
                                    }}
                                />
                                <br />
                                <button type='submit' style={{
                                    backgroundColor: 'var(--bakemaniaGold)',
                                }}>Zapisz</button>
                            </form>
                            <br />


                            <div className="manage-section-form">
                                <div className='manage-section-form__header --admin'>
                                    <UserIcon.Admin />
                                    <strong>Backup</strong>
                                    <span>
                                        Użyj poniższego przycisku, żeby wygenerować backup bazy danych i wysłać go na email.
                                    </span>
                                </div>

                                <button onClick={() => setShowBackupPanel(true)}>
                                    Backup bazy danych
                                </button>
                            </div>

                            {!dbCopyExists && (
                                <div className="manage-section-form">
                                    <div className='manage-section-form__header --admin'>
                                        <UserIcon.Admin />
                                        <strong>Wgraj kopię bazy danych</strong>
                                        <span>
                                            Użyj poniższego przycisku, aby wgrać kopię bazy danych na serwer. To działanie nie zastępuje istniejącej bazy danych, ale oblokowuje kolejny krok przywracania.
                                        </span>
                                    </div>

                                    <input
                                        type="file"
                                        accept=".zip"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                            }
                                        }}
                                    />
                                    <button
                                        disabled={!selectedFile}
                                        onClick={() => {
                                            if (!selectedFile) {
                                                alert('Wybierz plik archiwum');
                                                return;
                                            }
                                            setShowFileRestorePanel(true);
                                        }}
                                    >
                                        Wgraj kopię bazy danych
                                    </button>
                                    {selectedFile && (
                                        <button
                                            className='secondary'
                                            onClick={() => {
                                                setSelectedFile(null);
                                                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                                                if (input) {
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            Cofnij
                                        </button>
                                    )}
                                </div>
                            )}
                            {dbCopyExists && (
                                <div className="manage-section-form">
                                    <div className='manage-section-form__header --admin'>
                                        <UserIcon.Admin />
                                        <strong>Usuwanie kopii z serwera</strong>
                                        <span>
                                            Użyj poniższego przycisku, aby usunąć z serwera kopię bazy danych,
                                            jeśli została już wgrana (lub jeśli nie jest już potrzebna).
                                            Póki nie zostanie usunięta, nie będzie można wgrać nowej kopii.
                                        </span>
                                    </div>

                                    <button onClick={() => setShowRemovePanel(true)}>
                                        Usuwanie kopii z serwera
                                    </button>
                                </div>
                            )}
                            {dbCopyExists && (
                                <div className="manage-section-form">
                                    <div className='manage-section-form__header --admin'>
                                        <UserIcon.Admin />
                                        <strong>Na serwerze istnieje kopia bazy danych</strong>
                                        <span>
                                            Użyj poniższego przycisku, aby wgrać bazę danych z istniejącej na serwerze kopii.
                                        </span>
                                    </div>

                                    <button onClick={() => setShowRestorePanel(true)}>
                                        Przywróć bazę danych z kopii
                                    </button>
                                </div>
                            )}
                            <br />
                            <br />
                        </>
                    )
                }


                <BottomPanel
                    title={(
                        <div className="manage-section__panel-promote-title"><UserIcon.Customer />
                            {selectedCustomer?.email}
                        </div>
                        // eslint-disable-next-line
                    ) as any}
                    show={!!selectedCustomer}
                    toggleBottomPanel={() => setSelectedCustomer(null)}
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
                            disabled={customerPanelBlocked}
                            style={{
                                backgroundColor: 'var(--customer)',
                                borderColor: 'var(--customer)',
                                color: 'white',
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                            }}
                            onClick={async () => {
                                if (selectedCustomer) {
                                    setCustomerPanelBlocked(true);
                                    await dispatch(usersActions.promoteUser({ userId: selectedCustomer._id }));
                                    await dispatch(usersActions.fetchUsers({ page: foundUsersPage, size: foundUsersSize, email }));
                                    await dispatch(assistantsActions.fetchAssistants({ page, size }));
                                    setCustomerPanelBlocked(false);
                                    setSelectedCustomer(null);
                                }
                            }}
                        >
                            <UserIcon.Promote color="white" />Zatrudniam
                        </button>

                        <button
                            disabled={customerPanelBlocked}
                            onClick={() => setSelectedCustomer(null)}
                            style={{
                                flex: 1,
                            }}
                        >
                            Wróć
                        </button>
                    </div>
                </BottomPanel>

                <BottomPanel
                    title="Potwierdź przywrócenie bazy danych"
                    show={showRestorePanel}
                    toggleBottomPanel={() => setShowRestorePanel(false)}
                >
                    <div style={{ padding: '20px' }}>
                        <input
                            type="text"
                            placeholder="Wpisz 'studiujem prawo' aby potwierdzić"
                            value={restoreConfirmation}
                            onChange={(e) => setRestoreConfirmation(e.target.value)}
                            style={{ width: '100%', marginBottom: '10px' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                disabled={restoreConfirmation !== 'studiujem prawo'}
                                onClick={async () => {
                                    try {
                                        await apiService.fetch('admin/db-copy/restore', {
                                            method: 'POST',
                                            body: JSON.stringify({ confirmation: restoreConfirmation })
                                        });
                                        alert('Baza danych została przywrócona.');
                                        setShowRestorePanel(false);
                                        setRestoreConfirmation('');
                                    } catch (error) {
                                        alert(`Wystąpił błąd podczas przywracania bazy danych. ${error}`);
                                    }
                                }}
                                style={{
                                    backgroundColor: 'var(--bakemaniaGold)',
                                    flex: 1
                                }}
                            >
                                Przywróć
                            </button>
                            <button
                                onClick={() => {
                                    setShowRestorePanel(false);
                                    setRestoreConfirmation('');
                                }}
                                style={{ flex: 1 }}
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                </BottomPanel>

                <BottomPanel
                    title="Potwierdź utworzenie backupu"
                    show={showBackupPanel}
                    toggleBottomPanel={() => setShowBackupPanel(false)}
                >
                    <div style={{ padding: '20px' }}>
                        <p style={{ marginBottom: '20px' }}>Czy utworzyć backup bazy danych i wysłać na e-mail?</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await apiService.fetch('admin/db-copy', {
                                            method: 'GET',
                                        });
                                        if (response.success) {
                                            alert('Backup został wysłany emailem.');
                                        } else {
                                            alert('Nie udało się wysłać backupu emailem.');
                                        }
                                        setShowBackupPanel(false);
                                    } catch (error) {
                                        alert(`Wystąpił błąd podczas tworzenia backupu. ${error}`);
                                    }
                                }}
                                style={{
                                    backgroundColor: 'var(--bakemaniaGold)',
                                    flex: 1
                                }}
                            >
                                Potwierdź
                            </button>
                            <button
                                onClick={() => setShowBackupPanel(false)}
                                style={{ flex: 1 }}
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                </BottomPanel>

                <BottomPanel
                    title="Potwierdź wgranie pliku"
                    show={showFileRestorePanel}
                    toggleBottomPanel={() => setShowFileRestorePanel(false)}
                >
                    <div style={{ padding: '20px' }}>
                        <p style={{ marginBottom: '20px' }}>Czy wgrać bazę danych z wybranego pliku?</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={async () => {
                                    if (!selectedFile) {
                                        alert('Wybierz plik archiwum');
                                        return;
                                    }

                                    const formData = new FormData();
                                    formData.append('file', selectedFile);

                                    await fetch('api/admin/db-upload', {
                                        method: 'POST',
                                        body: formData,
                                        headers: {
                                            'Authorization': `Bearer ${window.localStorage.getItem(Config.sessionKeys.Token)}`,
                                        }
                                    }).then((res) => {
                                        return res.json();
                                    }).then((data: { success: boolean, message: string }) => {

                                        if (!data.success) {
                                            noticesStore.dispatch(noticesSlice.actions.addNotice({
                                                _id: uuid.v4(),
                                                header: 'Nie udało się wgrać kopii bazy danych.',
                                                body: data.message,
                                            }))
                                        } else {
                                            alert('Baza danych została wgrana.');
                                        }

                                    }).catch(e => {
                                        noticesStore.dispatch(noticesSlice.actions.addNotice({
                                            _id: uuid.v4(),
                                            header: 'Nieokreślony błąd',
                                            body: `Wystąpił błąd podczas wgrania kopii bazy danych. ${e}`,
                                        }))
                                    }).finally(() => {
                                        setShowFileRestorePanel(false);
                                        setSelectedFile(null);
                                        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                                        if (input) {
                                            input.value = '';
                                        }
                                    });

                                    await checkDbCopy();
                                }}
                                style={{
                                    backgroundColor: 'var(--bakemaniaGold)',
                                    flex: 1
                                }}
                            >
                                Wgraj
                            </button>
                            <button
                                onClick={() => setShowFileRestorePanel(false)}
                                style={{ flex: 1 }}
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                </BottomPanel>

                <BottomPanel
                    title="Potwierdź usunięcie kopii"
                    show={showRemovePanel}
                    toggleBottomPanel={() => setShowRemovePanel(false)}
                >
                    <div style={{ padding: '20px' }}>
                        <p style={{ marginBottom: '20px' }}>Czy usunąć kopię bazy danych z serwera?</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await apiService.fetch('admin/db-copy/remove', {
                                            method: 'DELETE',
                                        });
                                        if (response.success) {
                                            await checkDbCopy();
                                            alert('Kopia bazy danych została usunięta.');
                                        } else {
                                            noticesStore.dispatch(noticesSlice.actions.addNotice({
                                                _id: uuid.v4(),
                                                header: 'Nie udało się usunąć kopii bazy danych.',
                                                body: response.message,
                                            }));
                                        }
                                        setShowRemovePanel(false);
                                    } catch (error) {
                                        noticesStore.dispatch(noticesSlice.actions.addNotice({
                                            _id: uuid.v4(),
                                            header: 'Nieokreślony błąd',
                                            body: `Wystąpił błąd podczas usuwania kopii bazy danych. ${error}`,
                                        }));
                                    }
                                }}
                                style={{
                                    backgroundColor: 'var(--bakemaniaGold)',
                                    flex: 1
                                }}
                            >
                                Usuń
                            </button>
                            <button
                                onClick={() => setShowRemovePanel(false)}
                                style={{ flex: 1 }}
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                </BottomPanel>

                <div className="manage-section-form">
                    <div className='manage-section-form__header --admin'>
                        <UserIcon.Admin />
                        <strong>Czyszczenie logów</strong>
                        <span>
                            Usuń wszystkie pliki logów i odtwórz strukturę katalogów.
                        </span>
                    </div>

                    <button onClick={() => setShowFlushLogsPanel(true)}>
                        Wyczyść logi
                    </button>
                </div>

                <BottomPanel
                    title="Potwierdź czyszczenie logów"
                    show={showFlushLogsPanel}
                    toggleBottomPanel={() => setShowFlushLogsPanel(false)}
                >
                    <div style={{ padding: '20px' }}>
                        <p style={{ marginBottom: '20px' }}>Czy na pewno chcesz wyczyścić wszystkie logi? Ta operacja jest nieodwracalna.</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleFlushLogs}
                                disabled={isFlushingLogs}
                                style={{
                                    backgroundColor: 'var(--bakemaniaGold)',
                                    flex: 1
                                }}
                            >
                                {isFlushingLogs ? 'Czyszczenie...' : 'Wyczyść'}
                            </button>
                            <button
                                onClick={() => setShowFlushLogsPanel(false)}
                                disabled={isFlushingLogs}
                                style={{ flex: 1 }}
                            >
                                Anuluj
                            </button>
                        </div>
                    </div>
                </BottomPanel>


            </PanelViewTemplate>
        </AsidePanel >
    );
};

export default ManageSection;