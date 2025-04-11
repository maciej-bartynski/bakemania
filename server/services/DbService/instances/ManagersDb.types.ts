import UserRole, { ChangePasswordData, StampsHistoryEntry } from "./UsersDb.types";
import { VerificationData } from "./UsersDb.types";

type ManagerModel = {
    _id: string,
    email: string,
    password: string,
    role: UserRole.Manager,
    transactionsHistory: StampsHistoryEntry[],
    agreements: true,
    verification: VerificationData,
    changePassword?: ChangePasswordData,
}

type SanitizedManagerModel = {
    _id: string,
    email: string,
    role: UserRole.Manager,
    transactionsHistory: StampsHistoryEntry[],
    agreements: true,
    verification: {
        isVerified: boolean,
    },
    changePassword?: undefined,
};


export type {
    ManagerModel,
    SanitizedManagerModel
}