export interface ICategory {
  _id: string ,
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}