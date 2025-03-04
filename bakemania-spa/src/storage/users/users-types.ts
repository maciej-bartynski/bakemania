import ReducerState from "../types";

type OtherUser = {
    _id: string,
    email: string,
    stamps: {
        amount: number,
    }
}

type UsersState = {
    users: OtherUser[],
    status: ReducerState,
    error: string | null,
}

export type {
    UsersState,
    OtherUser
}