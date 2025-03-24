import UserRole from "./UsersDb.types"

type AdminModel = {
    _id: string,
    email: string,
    password: string,
    role: UserRole.Admin,
    history: string[],
    agreements: true,
}

type SanitizedAdminModel = {
    _id: string,
    email: string,
    role: UserRole.Admin,
    history: string[],
    agreements: true,
};


export type {
    AdminModel,
    SanitizedAdminModel
}