import mongoose, { Schema, Document, Model } from 'mongoose';

interface ICategory {
  categoryName: string;
  totalTickets: number;
  pricePerTicket: number;
}

interface IPromotionalContent {
  posterImageUrl?: string;
  tags?: string[];
  description: string;
}

interface IEvent extends Document {
  _id: string;
  ownerId: string;
  eventTitle: string;
  subTitle?: string; 
  startDate: Date;
  endDate: Date;
  location: string;
  categories: ICategory[];
  promotionalContent: IPromotionalContent;
}

const eventSchema = new Schema<IEvent>({
  ownerId: { type: String, required: true },
  eventTitle: { type: String, required: true },
  subTitle: {type: String},
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  categories: [{
    categoryName: { type: String, required: true },
    totalTickets: { type: Number, required: true },
    pricePerTicket: { type: Number, required: true }
  }],
  promotionalContent: {
    posterImageUrl: { type: String},
    tags: {type:[String]},
    description: { type: String, required: true }
  }
}, { timestamps: true });

export const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);
