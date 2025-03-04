import { createSlice } from "@reduxjs/toolkit";
import ReducerState from "../types";
import { UsersState } from "./users-types";
import usersActions from "./users-actions";


const initialState: UsersState = {
    status: ReducerState.Pristine,
    error: null,
    users: []
};

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {

    },


    extraReducers: (builder) => {
        builder
            /** Fetch me */
            .addCase(usersActions.fetchUsers.pending, (state) => {
                state.status = ReducerState.Fetching;
            })
            .addCase(usersActions.fetchUsers.fulfilled, (state, action) => {
                state.status = ReducerState.Idle;
                state.users = action.payload;
                state.error = null;
            })
            .addCase(usersActions.fetchUsers.rejected, (state, action) => {
                state.status = ReducerState.Error;
                state.users = [];
                state.error = (action.payload as string) || "Nieznany błąd przy pobieraniu danych innych użytkowników.";
            })
    }
});

export default usersSlice;
