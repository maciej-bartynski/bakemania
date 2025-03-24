import UserRole from "./UsersDb.types"

type ManagerModel = {
    _id: string,
    email: string,
    password: string,
    role: UserRole.Manager,
    history: string[],
    agreements: true,
}

type SanitizedManagerModel = {
    _id: string,
    email: string,
    role: UserRole.Manager,
    history: string[],
    agreements: true,
};


export type {
    ManagerModel,
    SanitizedManagerModel
}