import UserRole from "../me/me-types";
import ReducerState from "../types";

type OtherAssistant = {
    _id: string,
    email: string,
    role: UserRole,
    verification: {
        isVerified: boolean,
    },
    history: [],
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
}

export type {
    AssistantsState,
    OtherAssistant
}