export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ILoginResponse {
    userId: string;
    name: string;
	email: string;
    token: string;
    isActive: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
    profilePictureUrl: string;
    gptAccessTokenQuota: number;
}
