import { FC, useState } from "react";
import UserIcon from "../../../icons/UserIcon";
import { OtherUser } from "../../../storage/users/users-types";
import './CustomerItem.css';
import Icon from "../../../icons/Icon";
import IconName from "../../../icons/IconName";

const CustomerItem: FC<{
    user: OtherUser;
    userActions: {
        label: string;
        action: (user: OtherUser) => void;
        icon?: IconName;
        iconElement?: React.ReactNode;
    }[]
}> = ({
    user,
    userActions,
}) => {
        const [isExpanded, setIsExpanded] = useState(false);

        return (
            <div className="customer-item__customer-item">
                <div className="customer-item__customer-col-1">
                    <div className="customer-item__customer-icon-wrapper">
                        <UserIcon.Customer color="white" />
                    </div>
                    <div className="customer-item__customer-data">
                        <strong className="customer-item__customer-email">
                            {user.email}
                        </strong>
                        <span className="customer-item__customer-created-at">
                            Pieczątki:
                            <strong>
                                {user.stamps.amount ?? 0}
                            </strong>
                        </span>
                        <span className="customer-item__customer-created-at">
                            Dołączył(a): <strong>{user.metadata.createdAt}</strong>
                        </span>
                    </div>
                </div>

                <button
                    className="customer-item__detailsButton"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Icon iconName={IconName.Cog} color='var(--customer)' width={20} height={20} />
                </button>

                <div className={`customer-item__options ${isExpanded ? 'customer-item__options--expanded' : ''}`}>
                    <div className="customer-item__optionsContent">
                        {userActions.map(userAction => {
                            return (
                                <button
                                    className="customer-item__option"
                                    onClick={() => {
                                        userAction.action(user);
                                        setIsExpanded(false);
                                    }}
                                    style={{
                                        color: 'var(--customer)'
                                    }}
                                >
                                    {userAction.icon ? <Icon iconName={userAction.icon} color='var(--customer)' width={16} height={16} /> : null}
                                    {userAction.iconElement ? userAction.iconElement : null}
                                    {userAction.label}
                                </button>
                            )
                        })}
                        <button
                            className="customer-item__option"
                            onClick={() => setIsExpanded(false)}
                        >
                            <Icon iconName={IconName.ArrowDown} width={16} height={16} />
                            Schowaj
                        </button>
                    </div>
                </div>
            </div>
        );
    };

export default CustomerItem;