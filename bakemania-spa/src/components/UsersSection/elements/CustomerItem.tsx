import { FC } from "react";
import UserIcon from "../../../icons/UserIcon";
import { OtherUser } from "../../../storage/users/users-types";
import './CustomerItem.css';

const CustomerItem: FC<{
    user: OtherUser;
    userAction: {
        label: string;
        action: (user: OtherUser) => void;
        icon: React.ReactNode;
    }
}> = ({
    user,
    userAction,
}) => {

        return (
            <>
                <div
                    key={user._id}
                    className='customer-item__customer-item'
                >
                    <div className='customer-item__customer-col-1'>
                        <div className='customer-item__customer-icon-wrapper'>
                            <UserIcon.Customer color="white" />
                        </div>
                        <div className='customer-item__customer-data'>
                            <strong className='customer-item__customer-email'>
                                {user.email}
                            </strong>
                            <span className='customer-item__customer-created-at'>
                                Pieczątki:
                                <strong>
                                    {user.stamps.amount ?? 0}
                                </strong>
                            </span>
                            <span className='customer-item__customer-created-at'>
                                Dołączył(a): <strong>{user.metadata.createdAt}</strong>
                            </span>
                        </div>
                    </div>
                    <div className='customer-item__customer-col-2'>
                        <button

                            className='secondary'
                            onClick={(): void => userAction.action(user)}
                        >
                            {userAction.icon}{userAction.label}
                        </button>
                    </div>
                </div>
            </>
        );
    };

export default CustomerItem;