export interface ICreatePackageRequest {
    name: string;
    description: string;
    totalToken: number;
    price: number;
}

export interface IPackageResponse {
    _id: string
    name: string;
    description: string;
    totalToken: number;
    price: number;
    createdAt: string;
    updatedAt: string;
}
