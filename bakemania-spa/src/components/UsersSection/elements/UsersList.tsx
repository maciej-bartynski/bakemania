import useAppDispatch from "../../../storage/useAppDispatch";
import usersActions from "../../../storage/users/users-actions";
import UserIcon from "../../../icons/UserIcon";
import { FC, useEffect, useState } from "react";
import Pagination from "../../../atoms/Pagination/Pagination";
import CustomerItem from "./CustomerItem";
import useUsersSelector from "../../../storage/users/users-selectors";
import './UsersList.css'
import { OtherUser } from "../../../storage/users/users-types";

const UsersList: FC<{
    headerElement: React.ReactNode;
    userAction: {
        label: string,
        action: (user: OtherUser) => void;
        icon: React.ReactNode
    };
}> = ({
    headerElement,
    userAction
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
                        setUserEmail(e.target.value);
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
                            <UserIcon.Customer color="white" width={16} height={16} />
                            <span>
                                Użytkownicy:
                            </span>
                        </div>
                        {foundUsers.map((user) => (
                            <CustomerItem
                                user={user}
                                key={user._id}
                                userAction={userAction}
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