import { Types } from "mongoose";

export interface IMember {
  _id?: string | Types.ObjectId;
  name: {
    en: string;
    vi: string;
  };
  position: {
    en: string;
    vi: string;
  };
  image: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}