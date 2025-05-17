import UserRole, { ChangePasswordData, StampsHistoryEntry, VerificationData } from "./UsersDb.types"

type AdminModel = {
    _id: string,
    email: string,
    password: string,
    role: UserRole.Admin,
    transactionsHistory: StampsHistoryEntry[],
    agreements: true,
    verification: VerificationData,
    changePassword?: ChangePasswordData,
}

type SanitizedAdminModel = {
    _id: string,
    email: string,
    role: UserRole.Admin,
    transactionsHistory: StampsHistoryEntry[],
    agreements: true,
    verification: {
        isVerified: boolean,
    },
    changePassword?: undefined,
};


export type {
    AdminModel,
    SanitizedAdminModel
}