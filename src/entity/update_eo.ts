export interface IUpdateEventOrganizerRequest {
    userId: string;
    name: string;
	email: string;
    establishYear: number;
    contactNumber: string;
    industry: string;
    address: string;
    description: string;
    profilePictureUrl: string;
}

export interface IUpdateEventOrganizerResponse {
    userId: string;
    name: string;
	email: string;
    isActive: boolean;
    role: string;
    establishYear: number;
    contactNumber: string;
    industry: string;
    address: string;
    gptAccessTokenQuota: number;
    description: string;
    profilePictureUrl: string;
    createdAt: string;
    updatedAt: string;
}
