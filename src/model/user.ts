import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  profilePictureUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  profilePictureUrl: { type: String, default: ''},
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date },
}, {timestamps: true});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
