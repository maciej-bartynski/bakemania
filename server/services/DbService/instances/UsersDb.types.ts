enum UserRole {
    Admin = 'admin',
    Manager = 'manager',
    User = 'user'
}

type UserCard = {
    hash: string,
    createdAt: number,
}

type StampsHistoryEntry = {
    _id: string,
    createdAt: string,
    by: number,
    balance: number,
    assistantId: string,
}

type UserModel = {
    _id: string,
    email: string,
    password: string,
    role: UserRole.User,
    card?: UserCard,
    stamps: {
        amount: number,
        history: StampsHistoryEntry[]
    },
    agreements: true,
    verification: {
        isVerified: boolean,
        token?: string | undefined,
    } & ({
        isVerified: true,
    } | {
        isVerified: false,
        token: string,
    })
};

type SanitizedUserModel = {
    _id: string,
    email: string,
    role: UserRole,
    stamps: {
        amount: number,
        history: StampsHistoryEntry[]
    },
    agreements: true,
    verification: {
        isVerified: boolean,
    }
};

export default UserRole;

export type {
    UserCard,
    UserModel,
    UserRole,
    SanitizedUserModel,
    StampsHistoryEntry,
}