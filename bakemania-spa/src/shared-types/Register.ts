type RegisterRequestBody = {
    email: string;
    password: string;
    captchaToken: string;
    agreements: boolean;
}

type RegisterResponseBody = {
    id: string;
}

export type { RegisterRequestBody, RegisterResponseBody };
