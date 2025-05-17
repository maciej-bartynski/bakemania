import useAppDispatch from "../../../storage/useAppDispatch";
import usersActions from "../../../storage/users/users-actions";
import { FC, useEffect, useState } from "react";
import Pagination from "../../../atoms/Pagination/Pagination";
import CustomerItem from "./CustomerItem";
import useUsersSelector from "../../../storage/users/users-selectors";
import './UsersList.css'
import { OtherUser } from "../../../storage/users/users-types";
import IconName from "../../../icons/IconName";

const UsersList: FC<{
    headerElement?: React.ReactNode;
    userActions: {
        label: string,
        action: (user: OtherUser) => void;
        icon?: IconName;
        iconElement?: React.ReactNode;
    }[];
}> = ({
    headerElement,
    userActions
}) => {

        const dispatch = useAppDispatch();
        const [userEmail, setUserEmail] = useState<string | null>(null);
        const [userSearching, setUserSearching] = useState<boolean>(false);
        const { users: foundUsers, page: foundUsersPage, size: foundUsersSize, hasMore: foundUsersHasMore, email } = useUsersSelector();

        useEffect(() => {
            setUserEmail(email);
        }, [email])

        return (
            <div className='users-list --customer'>
                {headerElement}
                <input
                    type="text"
                    placeholder='Wyszukaj użytkownika po emailu'
                    value={userEmail ?? ""}
                    onChange={(e) => {
                        setUserEmail(e.target.value.toLowerCase());
                    }}
                />

                <button
                    disabled={userSearching}
                    onClick={async () => {
                        if (typeof userEmail === 'string' && !userEmail.includes(' ')) {
                            setUserSearching(true)
                            await dispatch(usersActions.fetchUsers({ page: 1, size: 10, email: userEmail }));
                            setUserSearching(false);
                        } else {
                            alert('Pole nie może zawierać spacji.');
                            setUserSearching(false);
                        }
                    }}
                >
                    {userSearching ? 'Wyszukuję...' : 'Wyszukaj'}
                </button>

                {foundUsers?.length > 0 ? (
                    <>
                        <div className='users-list__belt-header'>
                            Użytkownicy:
                        </div>
                        {foundUsers.map((user) => (
                            <CustomerItem
                                user={user}
                                key={user._id}
                                userActions={userActions}
                            />
                        ))}
                        <Pagination
                            page={foundUsersPage}
                            size={foundUsersSize}
                            hasMore={foundUsersHasMore}
                            onPageChange={async (nextPage) => {
                                await dispatch(usersActions.fetchUsers({ page: foundUsersPage + nextPage, size: 10, email }));
                            }}
                        />
                    </>
                ) : (
                    <span>
                        Nie ma jeszcze użytkowników systemu.
                    </span>
                )}
            </div>
        )
    }

export default UsersList;