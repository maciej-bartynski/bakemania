import { FC } from 'react';
import './AppUser.css';
import UserIcon from '../../icons/UserIcon';
import UserRole from '../../storage/me/me-types';

type AppUserProps = {
    email: string;
    role: UserRole;
};

const AppUser: FC<AppUserProps> = ({ email, role }) => {
    return (
        <div className="AppUser">
            {role === UserRole.Admin ? (
                <UserIcon.Admin />
            ) : role === UserRole.Manager ? (
                <UserIcon.Manager />
            ) : (
                <UserIcon.Customer />
            )}
            <strong>{email}</strong>
        </div>
    );
};

export default AppUser; 