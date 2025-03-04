// eslint-disable @typescript-eslint/no-explicit-any
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiService from "../../services/ApiService";
import anyErrorToDisplayError from "../../services/ErrorService";
import { OtherUser } from "./users-types";

const fetchUsers = createAsyncThunk<OtherUser[]>(
    "users/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            const otherUsers = await apiService
                .fetch('admin/users/get') as OtherUser[];
            if (otherUsers) {
                return otherUsers;
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

}

export default usersActions

