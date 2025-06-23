import { Types } from "mongoose";

export interface IService {
  _id?: string | Types.ObjectId;
  name: {
    en: string;
    vi: string;
  };
  img: string;
  link: string;
  description: {
    en: string;
    vi: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
