type Metadata = {
    createdAt: string,
    updatedAt?: string,
}

type Document<T extends Record<string, any>> = T & { _id: string, metadata: Metadata };

interface Pagination {
    page: number,
    size: number,
}

export type {
    Document,
    Metadata,
    Pagination
}