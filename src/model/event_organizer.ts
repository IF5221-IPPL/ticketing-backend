import mongoose, { Schema, Document } from 'mongoose';

interface IEventOrganizer extends Document {
  userId: string;
  establishYear: number;
  contactNumber: string;
  industry: string;
  address: string;
  gptAccessTokenQuota: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventOrganizerSchema: Schema = new Schema({
  userId: { type: String, required: true },
  establishYear: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  industry: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  gptAccessTokenQuota: {type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date },
}, {timestamps: true});

const EventOrganizer = mongoose.model<IEventOrganizer>('EventOrganizer', eventOrganizerSchema);
export default EventOrganizer;
