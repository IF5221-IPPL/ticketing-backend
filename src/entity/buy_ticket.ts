export interface IBuyTicketDetail {
    categoryName: string;
    totalTickets: number;
    totalPrice : number;
}

export interface IBuyTicketRequest {
    detail: IBuyTicketDetail[];
}

export interface IBuyTicketResponse {
    _id: string
    userId: string;
    eventId: string;
    category: IBuyTicketDetail[];
    status: string;
    createdAt: string;
    updatedAt: string;
}
