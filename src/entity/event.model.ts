// event.model.ts
import mongoose, { Schema } from 'mongoose';

const eventSchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  tickerPrice: { type: Number, required: true },
  startDate: { type: Date, required: true },
  maxTicketCount: { type: Number, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
