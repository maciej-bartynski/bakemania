import { createAsyncThunk } from "@reduxjs/toolkit";
import { Me } from "./me-types";
import apiService from "../../services/ApiService";

const fetchMe = createAsyncThunk<Me>(
    "me/fetchMe",
    async (_, { rejectWithValue }) => {
        try {
            const me = await apiService
                .fetch('user/me');
            if (me) {
                return me;
            }
            return rejectWithValue('Nie udało się pobrać danych Użytkownika [1]');
        } catch {
            return rejectWithValue('Nie udało się pobrać danych Użytkownika [2]');
        }
    }
);

const meActions = {
    fetchMe,
}

export default meActions

