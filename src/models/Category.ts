import mongoose, { Schema } from 'mongoose';
import { ICategory } from '@/lib/types/icategory';

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure updatedAt is updated on save
CategorySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);