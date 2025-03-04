// eslint-disable @typescript-eslint/no-explicit-any
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/ApiService";
import anyErrorToDisplayError from "../../services/ErrorService";
import { AppConfig } from "./appConfig-types";

const getAppConfig = createAsyncThunk<AppConfig>(
    "appConfig/getAppConfig",
    async (_, { rejectWithValue }) => {
        try {
            const appConfig = await apiService
                .fetch('app-config/get');
            if (appConfig) {
                return appConfig;
            } else {
                return rejectWithValue('Nie udało się pobrać konfiguracji aplikacji.');
            }
        } catch (appConfigError) {
            return rejectWithValue(anyErrorToDisplayError(appConfigError));
        }
    }
);

const appConfigActions = {
    getAppConfig
}

export default appConfigActions

