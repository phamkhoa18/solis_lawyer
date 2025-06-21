import { Schema, model, models } from 'mongoose';
import { IMenu } from '@/lib/types/imenu';

// Mongoose Schema
const menuSchema = new Schema<IMenu>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    link: {
      type: String,
      required: true,
      trim: true,
      default: '/',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true, // tối ưu hóa tìm kiếm theo thứ tự
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
      default: null,
      index: true, // tối ưu hóa tìm kiếm theo parentId
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
        default: [],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // tự động thêm createdAt và updatedAt
  }
);

// Tránh lỗi model compile nhiều lần khi hot reload
export const Menu = models.Menu || model<IMenu>('Menu', menuSchema);