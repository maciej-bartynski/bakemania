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

type StampsHistoryEntry = {
    _id: string,
    createdAt: string,
    by: number,
    balance: number,
    assistantId: string,
}

type Me = {
    _id: string,
    email: string,
    stamps: {
        amount: number,
        history: StampsHistoryEntry[]
    },
    role: UserRole
}

export type {
    Me,
    MeState,
    UserRole,
    StampsHistoryEntry
}

export default UserRole