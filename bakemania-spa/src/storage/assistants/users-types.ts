import UserRole, { StampsHistoryEntry } from "../me/me-types";
import ReducerState from "../types";

type OtherAssistant = {
    _id: string,
    email: string,
    role: UserRole,
    verification: {
        isVerified: boolean,
    },
    transactionsHistory: StampsHistoryEntry[],
    metadata: {
        createdAt: string,
        updatedAt?: string,
    }
}

type AssistantsState = {
    assistants: OtherAssistant[],
    hasMore: boolean,
    page: number,
    size: number,
    status: ReducerState,
    error: string | null,
    admins: {
        admins: OtherAssistant[],
        hasMore: boolean,
    }
}

export type {
    AssistantsState,
    OtherAssistant
}