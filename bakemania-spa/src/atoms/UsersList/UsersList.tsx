import { FC, useEffect } from "react";
import './UsersList.css';
import useAppDispatch from "../../storage/useAppDispatch";
import useUsersSelector from "../../storage/users/users-selectors";
import usersActions from "../../storage/users/users-actions";
import UserShort from "../UserShort/UserShort";
import useAppConfigSelector from "../../storage/appConfig/appConfig-selectors";

const UsersList: FC<{
    setUserEditId: (userId: string) => void
}> = ({
    setUserEditId
}) => {

        const dispatch = useAppDispatch();
        const usersSlice = useUsersSelector();
        const { appConfig } = useAppConfigSelector();

        useEffect(() => {
            dispatch(usersActions.fetchUsers());
        }, [dispatch]);

        return (
            <section className="users-list">
                <ul className="users-list__list">
                    {usersSlice.users.map(user => (
                        <li key={user._id} className="users-list__item">
                            <div className="users-list__item-left-col">
                                <UserShort
                                    userId={user._id}
                                    userEmail={user.email}
                                    userStampsAmount={user.stamps.amount}
                                    userGiftsAmount={Math.floor((user.stamps.amount ?? 0) / (appConfig?.cardSize ?? 0))}
                                />
                            </div>
                            <button
                                className="users-list__item-button"
                                onClick={() => {
                                    setUserEditId(user._id);
                                }}
                            >
                                Edytuj
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        )
    }

export default UsersList;