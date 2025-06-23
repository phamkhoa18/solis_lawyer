import mongoose, { Schema } from 'mongoose';
import { ICaseStudy } from '@/lib/types/icasestudy';
import Category from './Category';
import User from './User';

const CaseStudySchema: Schema<ICaseStudy> = new Schema(
  {
    title: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, required: true, trim: true, maxlength: 200 },
      vi: { type: String, required: true, trim: true, maxlength: 200 },
    },
    content: {
      en: { type: String, required: true },
      vi: { type: String, required: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    image: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: Category, required: true },
    user: { type: Schema.Types.ObjectId, ref: User, required: true },
    publishedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    viewsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CaseStudySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.CaseStudy || mongoose.model<ICaseStudy>('CaseStudy', CaseStudySchema);