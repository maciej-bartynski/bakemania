import ReducerState from "../types";

type AppConfig = {
    cardSize: number,
    discount: number,
    stampsInRow: number,
    maxCardsPerTransaction: number,
}

interface AppConfigState {
    status: ReducerState;
    error: string | null;
    appConfig: AppConfig | null;
}

export type {
    AppConfig,
    AppConfigState
}