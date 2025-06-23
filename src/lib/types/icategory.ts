import mongoose from 'mongoose';

export interface ICategory {
  _id?: string | mongoose.Types.ObjectId;
  name: { en: string; vi: string };
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}