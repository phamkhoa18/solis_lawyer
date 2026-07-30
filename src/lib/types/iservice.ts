import { Types } from "mongoose";
import { IMember } from "./imember";

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
  icon?: string;
  benefits?: {
    en: string[];
    vi: string[];
  };
  team?: (string | Types.ObjectId | IMember)[];
  createdAt?: Date;
  updatedAt?: Date;
}
