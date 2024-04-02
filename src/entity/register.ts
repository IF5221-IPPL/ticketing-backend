export interface IRegisterRequest {
    username: string;
    name: string;
	email: string;
    password: string;
    role: string;
}

export interface IRegisterResponse {
    username: string;
    name: string;
	email: string;
    token: string;
    isActive: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
}
