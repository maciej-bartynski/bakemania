import { createSlice } from "@reduxjs/toolkit";
import ReducerState from "../types";
import { AppConfigState } from "./appConfig-types";
import appConfigActions from "./appConfig-actions";

const initialState: AppConfigState = {
    status: ReducerState.Pristine,
    error: null,
    appConfig: null
};

const appConfigSlice = createSlice({
    name: "appConfig",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },


    extraReducers: (builder) => {
        builder
            .addCase(appConfigActions.getAppConfig.pending, (state) => {
                state.status = ReducerState.Fetching;
            })
            .addCase(appConfigActions.getAppConfig.fulfilled, (state, action) => {
                state.status = ReducerState.Idle;
                state.appConfig = action.payload;
                state.error = null;
            })
            .addCase(appConfigActions.getAppConfig.rejected, (state, action) => {
                state.status = ReducerState.Error;
                state.appConfig = null;
                state.error = (action.payload as string) || "Nieznany błąd przy pobieraniu konfiguracji aplikacji.";
            })
    }
});

export default appConfigSlice;
