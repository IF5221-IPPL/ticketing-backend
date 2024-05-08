interface ITransactionDetails {
    id: string;
    category: string;
    amount: number;
    numberOfTickets: number;
  }
  
  interface IEventDetails {
    title: string;
    startDate: Date;
    endDate: Date;
  }
  
 export interface ITicketPurchaseResponse {
    transaction: ITransactionDetails;
    event: IEventDetails;
  }
  