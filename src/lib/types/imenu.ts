import { Types } from "mongoose";

export interface IMenu {
  _id: string | Types.ObjectId;
  name: { en: string; vi: string };
  link: string;
  slug: string;
  icon?: string;
  order: number;
  parentId?: string | Types.ObjectId | null;
  children?: (string | Types.ObjectId)[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMenuTree extends Omit<IMenu, 'children'> {
  children?: IMenuTree[];
}