import { createSlice } from "@reduxjs/toolkit";
import ReducerState from "../types";
import { UsersState } from "./users-types";
import usersActions from "./users-actions";


const initialState: UsersState = {
    status: ReducerState.Pristine,
    error: null,
    users: [],
    hasMore: true,
    page: 1,
    size: 10,
    email: "",
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
                state.users = action.payload.users;
                state.hasMore = action.payload.hasMore;
                state.page = action.payload.page;
                state.size = action.payload.size;
                state.email = action.payload.email;
                state.error = null;
            })
            .addCase(usersActions.fetchUsers.rejected, (state, action) => {
                state.status = ReducerState.Error;
                state.users = [];
                state.hasMore = true;
                state.page = 1;
                state.size = 10;
                state.email = "";
                state.error = (action.payload as string) || "Nieznany błąd przy pobieraniu danych innych użytkowników.";
            })
    }
});

export default usersSlice;
