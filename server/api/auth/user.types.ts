enum UserRole {
    Admin = 'admin',
    Manager = 'manager',
    User = 'user'
}

type UserModel = {
    _id: string,
    email: string,
    password: string,
    role: UserRole,
    stamps: {
        amount: number,
        // previousAmount: number,
        // changedBy: string,
        // changedAt: number
    }
};

export default UserRole;

export type {
    UserModel,
    UserRole
}