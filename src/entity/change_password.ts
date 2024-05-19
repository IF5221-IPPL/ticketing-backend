export interface IChangePasswordRequest {
    userId: string;
	oldPassword: string;
    newPassword: string;
}

export interface IChangePasswordResponse {
    userId: string;
    name: string;
	email: string;
    isActive: boolean;
    role: string;
    profilePictureUrl: string;
    createdAt: string;
    updatedAt: string;
}
