import { useState } from "react";
import UserIcon from "../../../icons/UserIcon";
import { OtherAssistant } from "../../../storage/assistants/users-types";
import assistantsActions from "../../../storage/assistants/assistants-actions";
import useAppDispatch from "../../../storage/useAppDispatch";
import useAssistantsSelector from "../../../storage/assistants/users-selectors";
import BottomPanel from "../../../atoms/BottomPanel/BottomPanel";
import usersActions from "../../../storage/users/users-actions";
import useUsersSelector from "../../../storage/users/users-selectors";

const ManagerItem = ({
    manager,
}: {
    manager: OtherAssistant;
}) => {
    const [userEditing, setUserEditing] = useState(false);
    const dispatch = useAppDispatch();
    const { page, size } = useAssistantsSelector();
    const { page: usersPage, size: usersSize, email: usersEmail } = useUsersSelector();
    const [showDestroyPanel, setShowDestroyPanel] = useState(false);
    const toggleDestroyPanel = () => {
        setShowDestroyPanel(!showDestroyPanel);
    }

    return (
        <>
            <div
                key={manager._id}
                className='manage-section__manager-item'
            >
                <div className='manage-section__manager-col-1'>
                    <div className='manage-section__manager-icon-wrapper'>
                        <UserIcon.Manager color="white" />
                    </div>
                    <div className='manage-section__manager-data'>
                        <strong className='manage-section__manager-email'>
                            {manager.email}
                        </strong>
                        <span className='manage-section__manager-created-at'>
                            Dołączył(a): <strong>{manager.metadata.createdAt}</strong>
                        </span>
                    </div>
                </div>
                <div className='manage-section__manager-col-2'>
                    <button
                        disabled={userEditing}
                        className='secondary'
                        onClick={toggleDestroyPanel}
                    >
                        <UserIcon.Downgrade color="white" />Zwolnij
                    </button>
                </div>
            </div>


            <BottomPanel
                title={(
                    <div className="manage-section__panel-downgrade-title"><UserIcon.Manager />
                        {manager.email}
                    </div>
                    // eslint-disable-next-line
                ) as any}
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
                        style={{
                            backgroundColor: 'var(--manager)',
                            borderColor: 'var(--manager)',
                            color: 'white',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                        }}
                        onClick={async () => {
                            setUserEditing(true);
                            await dispatch(assistantsActions.downgradeAssistant({ assistantId: manager._id }));
                            await dispatch(assistantsActions.fetchAssistants({ page, size }));
                            await dispatch(usersActions.fetchUsers({ page: usersPage, size: usersSize, email: usersEmail }));
                            setUserEditing(false);
                        }}

                    >
                        <UserIcon.Downgrade color="white" />Zwalniam
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
    );
};

export default ManagerItem;