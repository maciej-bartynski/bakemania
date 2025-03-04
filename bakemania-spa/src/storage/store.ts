import { configureStore } from "@reduxjs/toolkit";
import me from "./me/me-reducer";
import appConfigSlice from "./appConfig/appConfig-reducer";
import usersSlice from "./users/users-reducer";

export const store = configureStore({
    reducer: {
        me: me.reducer,
        appConfig: appConfigSlice.reducer,
        users: usersSlice.reducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
