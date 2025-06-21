import mongoose, { Model, Schema } from 'mongoose';
import { IUser } from '@/lib/types/iuser';

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'editor', 'author'], default: 'admin' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Bỏ đoạn hash password và comparePassword

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
