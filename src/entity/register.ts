export interface IRegisterRequest {
    name: string;
	email: string;
    password: string;
}

export interface IRegisterResponse {
    userId: string;
    name: string;
	email: string;
    token: string;
    isActive: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
}
