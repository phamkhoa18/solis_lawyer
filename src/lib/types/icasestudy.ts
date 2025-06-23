import mongoose from 'mongoose';
import { ICategory } from './icategory';
import { IUser } from './iuser';

export interface ICaseStudy {
  _id?: string | mongoose.Types.ObjectId;
  title: { en: string; vi: string };
  description: { en: string; vi: string };
  content: { en: string; vi: string };
  slug: string;
  image: string;
  category: mongoose.Types.ObjectId | ICategory;
  user: mongoose.Types.ObjectId | IUser;
  publishedAt?: Date;
  isActive: boolean;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}