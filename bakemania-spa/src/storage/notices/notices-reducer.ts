import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import ReducerState from "../types";
import { NoticeItem, NoticesState } from "./notices-types";

const initialState: NoticesState = {
    status: ReducerState.Pristine,
    error: null,
    notices: []
};

const noticesSlice = createSlice({
    name: "notices",
    initialState,
    reducers: {
        addNotice(state, action: PayloadAction<NoticeItem>) {
            state.notices.push(action.payload);
        },

        deleteNotice(state, action: PayloadAction<string>) {
            state.notices = state.notices.filter(notice => {
                return notice._id != action.payload;
            })
        },

        clearNotices(state) {
            state.notices = [];
        }
    }

});

export default noticesSlice;
