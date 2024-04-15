export interface IRegisterAdminRequest {
    name: string;
	email: string;
    password: string;
}

export interface IRegisterAdminResponse {
    userId: string;
    name: string;
	email: string;
    token: string;
    isActive: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
}
