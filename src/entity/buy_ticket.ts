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
    eventStartDate: string;
    eventEndDate: string;
    eventTitle: string;
    eventSubTitle: string;
    eventLocation: string;
    category: IBuyTicketDetail[];
    status: string;
    createdAt: string;
    updatedAt: string;
}
