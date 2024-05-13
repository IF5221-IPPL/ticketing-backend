import mongoose, { Schema, Document } from 'mongoose';

interface IPackage extends Document {
  name: string;
  description: string;
  totalToken: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  totalToken: { type: Number, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date },
}, {timestamps: true});

const Package = mongoose.model<IPackage>('Package', packageSchema);
export default Package;
