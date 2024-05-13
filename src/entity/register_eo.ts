export interface IRegisterEventOrganizerRequest {
    name: string;
	email: string;
    password: string;
    establishYear: number;
    contactNumber: string;
    industry: string;
    address: string;
    description: string;
}

export interface IRegisterEventOrganizerResponse {
    userId: string;
    name: string;
	email: string;
    token: string;
    isActive: boolean;
    role: string;
    establishYear: number;
    contactNumber: string;
    industry: string;
    address: string;
    gptAccessTokenQuota: number;
    description: string;
    createdAt: string;
    updatedAt: string;
}
