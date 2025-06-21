
import {IType} from '@/lib/types/itype'
import {IUser} from '@/lib/types/iuser'
export interface IPost {
  _id: string ,
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: IUser | string ;
  type: IType | string,
  tags?: string[];
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  commentsCount: number;
}