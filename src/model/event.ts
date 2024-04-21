import mongoose, { Schema } from 'mongoose';

const eventSchema = new Schema({
  ownerId: { type: String, ref:'User', required: true},
  name: { type: String, required: true },
  description: { type: String, required: true },
  ticketPrice: { type: Number, required: true },
  startDate: { type: Date, required: true },
  maxTicketCount: { type: Number, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Event = mongoose.model('Event', eventSchema);

