import mongoose, { Schema, Document, Model } from 'mongoose';
interface ITicketPurchaseDetail {
    categoryName: string;
    totalTickets: number;
    totalPrice : number;
}

interface ITicketPurchase extends Document {
    _id: string;
    userId: string;
    eventId: string;
    eventStartDate: Date
    eventEndDate: Date
    eventLocation: string
    eventTitle: string
    eventSubTitle: string
    category: ITicketPurchaseDetail[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const ticketPurchaseSchema: Schema = new Schema({
    eventId: { type: String, required: true },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    eventLocation: { type: String, required: true },
    eventTitle: { type: String, required: true },
    eventSubTitle: { type: String },
    userId: { type: String, required: true },
    category: [{
        categoryName: { type: String, required: true },
        totalTickets: { type: Number, required: true },
        totalPrice: { type: Number, required: true }
    }],
    status : { type: String, required: true, default: 'active' },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date },
}, {timestamps: true});
  
const TicketPurchase = mongoose.model<ITicketPurchase>('TicketPurchase', ticketPurchaseSchema);
export default TicketPurchase;

  