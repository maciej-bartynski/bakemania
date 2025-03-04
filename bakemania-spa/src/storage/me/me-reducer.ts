import { createSlice } from "@reduxjs/toolkit";
import { MeState } from "./me-types";
import ReducerState from "../types";
import meActions from "./me-actions";

const initialState: MeState = {
    status: ReducerState.Pristine,
    error: null,
    me: null
};

const meSlice = createSlice({
    name: "me",
    initialState,
    reducers: {
        clearMe: (state) => {
            state.status = ReducerState.Idle;
            state.error = null;
            state.me = null;
        },

        clearError: (state) => {
            state.error = null;
        }
    },


    extraReducers: (builder) => {
        builder
            /** Fetch me */
            .addCase(meActions.fetchMe.pending, (state) => {
                state.status = ReducerState.Fetching;
            })
            .addCase(meActions.fetchMe.fulfilled, (state, action) => {
                state.status = ReducerState.Idle;
                state.me = action.payload;
                state.error = null;
            })
            .addCase(meActions.fetchMe.rejected, (state, action) => {
                state.status = ReducerState.Error;
                state.me = null;
                state.error = (action.payload as string) || "Nieznany błąd przy pobieraniu danych.";
            })
            /** Log in */
            .addCase(meActions.logIn.pending, (state) => {
                state.status = ReducerState.Fetching;
            })
            .addCase(meActions.logIn.fulfilled, (state, action) => {
                state.status = ReducerState.Idle;
                state.me = action.payload;
                state.error = null;
            })
            .addCase(meActions.logIn.rejected, (state, action) => {
                state.status = ReducerState.Error;
                state.me = null;
                state.error = (action.payload as string) || "Nieznany błąd przy logowaniu.";
            })
            /** Log out */
            .addCase(meActions.logOut.pending, (state) => {
                state.status = ReducerState.Fetching;
            })
            .addCase(meActions.logOut.fulfilled, (state) => {
                state.status = ReducerState.Idle;
                state.me = null;
                state.error = null;
            })
            .addCase(meActions.logOut.rejected, (state, action) => {
                state.status = ReducerState.Error;
                state.error = (action.payload as string) || "Nieznany błąd przy wylogowaniu.";
            })
            /** Register */
            .addCase(meActions.register.pending, (state) => {
                state.status = ReducerState.Fetching;
            })
            .addCase(meActions.register.fulfilled, (state, action) => {
                state.status = ReducerState.Idle;
                state.me = action.payload;
                state.error = null;
            })
            .addCase(meActions.register.rejected, (state, action) => {
                state.status = ReducerState.Error;
                state.error = (action.payload as string) || "Nieznany błąd przy rejestracji.";
            });
    }
});

export default meSlice;
