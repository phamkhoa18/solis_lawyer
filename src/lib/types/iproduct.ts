
import {ICategory} from '@/lib/types/icategory' ;
export interface IProduct {
  _id: string
  title: string
  shortContent: string
  content: string
  image: string
  images?: string[]
  width?: number
  height?: number
  category: ICategory,
  date: Date ,
  createdAt?: Date
  updatedAt?: Date
}
