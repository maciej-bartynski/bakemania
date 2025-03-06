// eslint-disable @typescript-eslint/no-explicit-any
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Me } from "./me-types";
import apiService from "../../services/ApiService";
import anyErrorToDisplayError from "../../services/ErrorService";

// const apiUrl = import.meta.env.VITE_API_URL;

const fetchMe = createAsyncThunk<Me>(
    "me/fetchMe",
    async (_, { rejectWithValue }) => {
        try {
            const me = await apiService
                .fetch('user/me');
            if (me) {
                return me;
            } else {
                return rejectWithValue('Nie udało się pobrać danych Użytkownika.');
            }
        } catch (meError) {
            try {
                await apiService.fetch('auth/logout', undefined, [204]);
                window.localStorage.removeItem('token');
                window.localStorage.removeItem('me');
            } catch (logoutError) {
                return rejectWithValue(anyErrorToDisplayError(logoutError));
            }
            return rejectWithValue(anyErrorToDisplayError(meError));
        }
    }
);

// function urlBase64ToUint8Array(base64String: string) {
//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//         .replace(/-/g, '+')
//         .replace(/_/g, '/');
//     const rawData = atob(base64);
//     const outputArray = new Uint8Array(rawData.length);
//     for (let i = 0; i < rawData.length; ++i) {
//         outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
// }

// const fetchVapidKey = async (): Promise<Uint8Array<ArrayBuffer>> => {
//     const vapidKey = await fetch(`${apiUrl}/notifications/get-vapid-public-key`)
//         .then(response => response.json())
//         .then(vapidKey => urlBase64ToUint8Array(vapidKey.publicKey));
//     return vapidKey;
// }

const logIn = createAsyncThunk<Me, { email: string, password: string }>(
    "me/logIn",
    async (params, { rejectWithValue }) => {

        try {

            const pushSubscription: PushSubscription | null = null;
            // try {
            //     const vapidKey = await fetchVapidKey();
            //     const permission = await Notification.requestPermission();

            //     if (!vapidKey || permission !== 'granted') {
            //         // return rejectWithValue(`Użytkownik nie przyznał Aplikacji uprawnienia "Push Notifications".`);
            //     }

            //     const registration = await navigator.serviceWorker.register('/sw.js');
            //     pushSubscription = await registration.pushManager.subscribe({
            //         userVisibleOnly: true,
            //         applicationServerKey: vapidKey
            //     });
            // } catch (e) {
            //     // nie ma suba
            //     console.warn(e);
            // }

            const loginResponse = await apiService.fetch('auth/login', {
                method: 'POST',
                body: JSON.stringify({ ...params, subscription: pushSubscription })
            })

            if (!loginResponse || !loginResponse?.token || typeof loginResponse?.token !== 'string') {
                return rejectWithValue('Nie udało się pobrać tokenu autoryzacji.');
            }

            const token = loginResponse.token as string;
            window.localStorage.setItem('token', token);
            const me: Me = await apiService.fetch('user/me');

            if (!me) {
                return rejectWithValue('Nie udało się pobrać danych Użytkownika.');
            }

            window.localStorage.setItem('me', JSON.stringify(me));
            return me;
        } catch (err) {
            function errTypeGuard(err: unknown): err is { message: string } {
                try {
                    if (err && (err as { message: string }).message) {
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            }

            if (errTypeGuard(err)) {
                return rejectWithValue(err.message);
            }

            return rejectWithValue(`Błąd: ${JSON.stringify(err)}.`);
        }
    }
);

const logOut = createAsyncThunk<void>(
    "me/logOut",
    async (_, { rejectWithValue }) => {
        try {
            await apiService.fetch('auth/logout', undefined, [204]);
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('me');
        }
        catch (errorData) {
            return rejectWithValue(errorData);
        }
    }
);

const register = createAsyncThunk<Me, { email: string, password: string }>(
    "me/register",
    async (params, { rejectWithValue }) => {
        try {
            const { email, password } = params;
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('me');

            // const vapidKey = await fetchVapidKey();
            // const permission = await Notification.requestPermission();
            // if (!vapidKey || permission !== 'granted') {
            //     return rejectWithValue(`Użytkownik nie przyznał Aplikacji uprawnienia "Push Notifications".`);
            // }
            // const registration = await navigator.serviceWorker.register('/sw.js');
            // const subscription = await registration.pushManager.subscribe({
            //     userVisibleOnly: true,
            //     applicationServerKey: vapidKey
            // });


            const { id } = await apiService.fetch('auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password
                })
            }, [201]) as { id: string };

            if (!id) {
                return rejectWithValue('Brak identyfikatora użytkownika w bazie.');
            }

            const loginResponse = await apiService.fetch('auth/login', {
                method: 'POST',
                body: JSON.stringify({ ...params, subscription: null })
            })

            if (!loginResponse || !loginResponse?.token || typeof loginResponse?.token !== 'string') {
                return rejectWithValue('Nie udało się pobrać tokenu autoryzacji.');
            }

            const token = loginResponse.token as string;
            window.localStorage.setItem('token', token);
            const me: Me = await apiService.fetch('user/me');

            if (!me) {
                return rejectWithValue('Nie udało się pobrać danych Użytkownika.');
            }

            window.localStorage.setItem('me', JSON.stringify(me));
            return me;

        } catch (err) {
            function errTypeGuard(err: unknown): err is { message: string } {
                try {
                    if (err && (err as { message: string }).message) {
                        return true;
                    }
                    return false;
                } catch {
                    return false;
                }
            }

            if (errTypeGuard(err)) {
                return rejectWithValue(err.message);
            }

            return rejectWithValue(`Błąd: ${JSON.stringify(err)}.`);
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

