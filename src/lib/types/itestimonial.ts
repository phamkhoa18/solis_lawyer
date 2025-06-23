import { Types } from "mongoose";

export interface ITestimonial extends Document {
  _id?: string | Types.ObjectId ;
  name: {
    en: string;
    vi: string;
  };
  image: string;
  content: {
    en: string;
    vi: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}