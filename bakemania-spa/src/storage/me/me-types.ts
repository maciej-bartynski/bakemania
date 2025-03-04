import ReducerState from "../types";

interface MeState {
    status: ReducerState;
    error: string | null;
    me: Me | null;
}

enum UserRole {
    Admin = 'admin',
    Manager = 'manager',
    User = 'user'
}

type Me = {
    _id: string,
    email: string,
    stamps: {
        amount: number,
    },
    role: UserRole
}

export type {
    Me,
    MeState,
    UserRole
}

export default UserRole