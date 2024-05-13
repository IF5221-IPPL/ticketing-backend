import mongoose, { Schema, Document } from 'mongoose';

interface IPurchase extends Document {
  userId: string;
  packageId: string;
  packageName: string;
  totalToken: number;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseSchema: Schema = new Schema({
  userId: { type: String, required: true },
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  totalToken: { type: Number, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date },
}, {timestamps: true});

const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);
export default Purchase;
