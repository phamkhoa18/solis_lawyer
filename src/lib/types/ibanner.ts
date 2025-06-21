import { Types } from "mongoose";

export interface IBanner {
  _id?: string | Types.ObjectId;
  image: string;
  name: {
    en: string;
    vi: string;
  };
  description?: {
    en: string;
    vi: string;
  };
  buttonText?: {
    en: string;
    vi: string;
  };
  link?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
