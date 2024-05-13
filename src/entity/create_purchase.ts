export interface ICreatePurchaseRequest {
    userId: string;
    packageId: string;
}

export interface IPurchaseResponse {
    _id: string
    userId: string;
    packageId: string;
    packageName: string;
    totalToken: number;
    createdAt: string;
    updatedAt: string;
}
