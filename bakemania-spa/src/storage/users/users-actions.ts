// eslint-disable @typescript-eslint/no-explicit-any
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/ApiService";
import anyErrorToDisplayError from "../../services/ErrorService";
import { OtherUser } from "./users-types";

const fetchUsers = createAsyncThunk<
    { users: OtherUser[], hasMore: boolean, page: number, size: number, email: string },
    { page: number, size: number, email?: string }
>(
    "users/fetchUsers",
    async (pagination: { page: number, size: number, email?: string }, { rejectWithValue }) => {
        try {
            const url = pagination.email
                ? `user?page=${pagination.page}&size=${pagination.size}&email=${pagination.email}`
                : `user?page=${pagination.page}&size=${pagination.size}`;

            const currentUsersData = await apiService
                .fetch(url) as { users: OtherUser[], hasMore: boolean };

            if (currentUsersData) {
                return {
                    ...currentUsersData,
                    page: pagination.page,
                    size: pagination.size,
                    email: pagination.email ?? "",
                };
            } else {
                return rejectWithValue('Nie udało się pobrać danych innych użytkowników.');
            }
        } catch (error) {

            return rejectWithValue(anyErrorToDisplayError(error));
        }
    }
);

const promoteUser = createAsyncThunk<string, { userId: string }>(
    "users/promoteUser",
    async (params, { rejectWithValue }) => {
        try {
            const data = await apiService
                .fetch(`user/${params.userId}/promote`, {
                    method: 'PUT',
                });
            const assistantId = data.assistantId;
            if (assistantId) {
                return assistantId;
            } else {
                return rejectWithValue('Nie udało się pobrać danych innych użytkowników.');
            }
        } catch (error) {

            return rejectWithValue(anyErrorToDisplayError(error));
        }
    }
);

const usersActions = {
    fetchUsers,
    promoteUser
}

export default usersActions

