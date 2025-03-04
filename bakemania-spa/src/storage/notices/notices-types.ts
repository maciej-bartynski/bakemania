import ReducerState from "../types";

type NoticeItem = {
    _id: string,
    header?: string,
    htmlHeader?: string,
    body?: string,
    htmlBody?: string
}

type NoticesState = {
    notices: NoticeItem[],
    status: ReducerState,
    error: string | null,
}

export type {
    NoticesState,
    NoticeItem
}