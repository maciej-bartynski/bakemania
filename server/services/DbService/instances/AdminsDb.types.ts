import UserRole, { ChangePasswordData, VerificationData } from "./UsersDb.types"

type AdminModel = {
    _id: string,
    email: string,
    password: string,
    role: UserRole.Admin,
    history: string[],
    agreements: true,
    verification: VerificationData,
    changePassword?: ChangePasswordData,
}

type SanitizedAdminModel = {
    _id: string,
    email: string,
    role: UserRole.Admin,
    history: string[],
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