import { createSlice } from "@reduxjs/toolkit";
import ReducerState from "../types";
import { AssistantsState } from "./users-types";
import assistantsAction from "./assistants-actions";


const initialState: AssistantsState = {
    status: ReducerState.Pristine,
    error: null,
    assistants: [],
    hasMore: true,
    page: 1,
    size: 10,
};

const assistantsSlice = createSlice({
    name: "assistants",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(assistantsAction.fetchAssistants.pending, (state) => {
                state.status = ReducerState.Fetching;
            })
            .addCase(assistantsAction.fetchAssistants.fulfilled, (state, action) => {
                state.status = ReducerState.Idle;
                state.assistants = action.payload.assistants;
                state.hasMore = action.payload.hasMore;
                state.page = action.payload.page;
                state.size = action.payload.size;
                state.error = null;
            })
            .addCase(assistantsAction.fetchAssistants.rejected, (state, action) => {
                state.status = ReducerState.Error;
                state.assistants = [];
                state.hasMore = true;
                state.page = 1;
                state.size = 10;
                state.error = (action.payload as string) || "Nieznany błąd przy pobieraniu danych innych asystentów.";
            })
    }
});

export default assistantsSlice;
