// eslint-disable @typescript-eslint/no-explicit-any
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/ApiService";
import anyErrorToDisplayError from "../../services/ErrorService";
import { OtherAssistant } from "./users-types";

const fetchAssistants = createAsyncThunk<
    { assistants: OtherAssistant[], hasMore: boolean, page: number, size: number, admins: { admins: OtherAssistant[], hasMore: boolean } },
    { page: number, size: number }
>(
    "users/fetchAssistants",
    async (pagination: { page: number, size: number }, { rejectWithValue }) => {
        try {
            const otherManagersData = await apiService
                .fetch(`assistant?page=${pagination.page}&size=${pagination.size}`) as { assistants: OtherAssistant[], hasMore: boolean, admins: { admins: OtherAssistant[], hasMore: boolean } };
            if (otherManagersData) {
                return {
                    ...otherManagersData,
                    page: pagination.page,
                    size: pagination.size,
                };
            } else {
                return rejectWithValue('Nie udało się pobrać danych asystentów.');
            }
        } catch (error) {
            return rejectWithValue(anyErrorToDisplayError(error));
        }
    }
);

const downgradeAssistant = createAsyncThunk<string, { assistantId: string }>(
    "assisntans/downgradeAssistant",
    async (params, { rejectWithValue }) => {
        try {
            const data = await apiService
                .fetch(`assistant/${params.assistantId}/downgrade`, {
                    method: 'PUT',
                });
            const userId = data.userId;
            if (userId) {
                return userId;
            } else {
                return rejectWithValue('Nie udało się pobrac danych asystenta po obniżeniu rangi.');
            }
        } catch (error) {

            return rejectWithValue(anyErrorToDisplayError(error));
        }
    }
);


const assistantsActions = {
    fetchAssistants,
    downgradeAssistant
}

export default assistantsActions;

