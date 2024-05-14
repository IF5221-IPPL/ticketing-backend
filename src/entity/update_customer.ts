export interface IUpdateCustomerRequest {
    userId: string;
    name: string;
	email: string;
    profilePictureUrl: string;
}

export interface IUpdateCustomerResponse {
    userId: string;
    name: string;
	email: string;
    isActive: boolean;
    role: string;
    profilePictureUrl: string;
    createdAt: string;
    updatedAt: string;
}