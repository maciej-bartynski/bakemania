import { FC, useEffect, useState } from 'react';
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

const ManageSection: FC<{
    active: boolean;
    toggleActive: () => void;
}> = ({
    active,
    toggleActive
}) => {
        const [isSaving, setIsSaving] = useState(false);
        const { me } = useMeSelector();
        const { appConfig, status } = useAppConfigSelector();
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
                                        action: toggleActive,
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
                                        icon: <UserIcon.Promote color="white" />
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

                                <div className='manage-section-form --manager'>
                                    <div className='manage-section-form__header --manager'>
                                        <UserIcon.Manager />
                                        <strong>Obecni pracownicy</strong>
                                        <span>
                                            Znajdź <UserIcon.Manager width={12} height={12} color='var(--text)' /> pracownika
                                            i odbierz mu <UserIcon.Downgrade width={12} height={12} color='var(--text)' /> uprawnienia.
                                        </span>
                                    </div>

                                    <div className='manage-section__manager-header'>
                                        <UserIcon.Manager color="white" width={16} height={16} />
                                        <span>
                                            Pracownicy bakeMAnii:
                                        </span>
                                    </div>
                                    {assistants.map((manager) => (
                                        <ManagerItem
                                            manager={manager}
                                            key={manager._id}
                                        />
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
                                    className='manage-section-form --admin'
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
                                    <button type='submit'>Zapisz</button>
                                </form>
                                <br />
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
                </PanelViewTemplate>
            </AsidePanel>
        );
    };

export default ManageSection;