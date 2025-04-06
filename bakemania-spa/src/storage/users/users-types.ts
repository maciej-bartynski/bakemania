import UserRole, { StampsHistoryEntry } from "../me/me-types";
import ReducerState from "../types";

type OtherUser = {
    _id: string,
    email: string,
    agreements: boolean,
    role: UserRole,
    stamps: {
        amount: number,
        history: StampsHistoryEntry[]
    },
    verification: {
        isVerified: boolean,
    },
    card: boolean,
    metadata: {
        createdAt: string,
        updatedAt?: string,
    }
}

type UsersState = {
    users: OtherUser[],
    status: ReducerState,
    error: string | null,
    hasMore: boolean,
    page: number,
    size: number,
    email: string,
}

export type {
    UsersState,
    OtherUser
}