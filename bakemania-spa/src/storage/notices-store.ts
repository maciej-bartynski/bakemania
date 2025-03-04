import { configureStore } from "@reduxjs/toolkit";
import noticesSlice from "./notices/notices-reducer";

export const noticesStore = configureStore({
    reducer: {
        notices: noticesSlice.reducer
    }
});

export type NoticesStoreState = ReturnType<typeof noticesStore.getState>;
export type NoticesStoreDispatch = typeof noticesStore.dispatch;
