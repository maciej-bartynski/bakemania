// eslint-disable @typescript-eslint/no-explicit-any
import { createAsyncThunk } from "@reduxjs/toolkit";
import UserRole, { Me } from "./me-types";
import apiService from "../../services/ApiService";
import Config from "../../config";
import clearSession from "../../tools/clearSession";
import { RegisterRequestBody } from "../../shared-types/Register";

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

const logIn = createAsyncThunk<Me, { email: string, password: string }>(
    "me/logIn",
    async (params, { rejectWithValue }) => {

        try {
            const loginResponse = await apiService.fetch('auth/login', {
                method: 'POST',
                body: JSON.stringify({ ...params })
            })

            if (!loginResponse || !loginResponse?.token || typeof loginResponse?.token !== 'string') {
                return rejectWithValue('Nie udało się pobrać tokenu autoryzacji.');
            }

            const token: string | null = (typeof loginResponse?.token === 'string' && loginResponse?.token?.trim())
                ? loginResponse.token as string
                : null;

            const me: Me = token
                ? await apiService.fetch('user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }) : null;


            let cardId: string | null = null;
            if (me.role == UserRole.User) {
                if (!loginResponse?.cardId || typeof loginResponse?.cardId !== 'string') {
                    return rejectWithValue('Nie udało się pobrać kodu karty.');
                }
                cardId = (typeof loginResponse?.cardId === 'string' && loginResponse?.cardId?.trim())
                    ? loginResponse.cardId as string
                    : null;
            }

            if (me && token) {
                window.localStorage.setItem(Config.sessionKeys.Token, token);
                window.localStorage.setItem(Config.sessionKeys.Me, JSON.stringify(me));
                if (cardId !== null) {
                    window.localStorage.setItem(Config.sessionKeys.CardId, cardId);
                }
                return me;
            }

            return rejectWithValue('Nie udało się pobrać danych Użytkownika [1]');

        } catch {
            return rejectWithValue('Nie udało się zalogować [2]');
        }
    }
);

const logOut = createAsyncThunk<void>(
    "me/logOut",
    clearSession
);

const register = createAsyncThunk<Me, { email: string, password: string, captchaToken: string, agreements: boolean }>(
    "me/register",
    async (params, { rejectWithValue }) => {
        try {
            const { email, password, captchaToken, agreements } = params;

            const registrationRequestBody: RegisterRequestBody = {
                email,
                password,
                captchaToken,
                agreements
            }

            const registrationResponse = await apiService.fetch('auth/register', {
                method: 'POST',
                body: JSON.stringify(registrationRequestBody)
            }, [201]);

            const loginResponse = registrationResponse ? await apiService.fetch('auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            }) : null;

            const token: string | null = (typeof loginResponse?.token === 'string' && loginResponse?.token?.trim())
                ? loginResponse.token as string
                : null;

            const me: Me | null = token ? await apiService.fetch('user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            }) : null;

            let cardId: string | null = null;
            if (me?.role === UserRole.User) {
                cardId = (typeof loginResponse?.cardId === 'string' && loginResponse?.cardId?.trim())
                    ? loginResponse.cardId as string
                    : null;
            }

            if (me && token) {
                window.localStorage.setItem(Config.sessionKeys.Token, token);
                window.localStorage.setItem(Config.sessionKeys.Me, JSON.stringify(me));
                if (cardId !== null) {
                    window.localStorage.setItem(Config.sessionKeys.CardId, cardId);
                }
                return me;
            }

            return rejectWithValue('Nie udało się utworzyć konta i zalogować [1]');

        } catch {
            return rejectWithValue('Nie udało się utworzyć konta i zalogować [2]');
        }
    }
);

const meActions = {
    fetchMe,
    logIn,
    logOut,
    register
}

export default meActions

