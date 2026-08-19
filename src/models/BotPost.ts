import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface IBotPost extends Document {
  plan: 'criminal' | 'family' | 'academic';
  topic: string;
  sourceUrl?: string;
  sourceTitle?: string;
  angle?: string;
  status: 'pending' | 'approved' | 'rejected' | 'failed' | 'awaiting_feedback';
  article?: {
    titleEn: string;
    titleVi: string;
    descEn: string;
    descVi: string;
    slug: string;
    tags: string[];
    contentEn: string;
    contentVi: string;
    quality?: Record<string, unknown>;
  };
  coverUrl?: string;
  categorySlug: string;
  casestudySlug?: string;
  tgChatId?: string;
  tgControlMessageId?: number;
  sentAt?: Date;
  publishedAt?: Date;
  feedback?: string;
  version: number;
  runDate: string; // YYYY-MM-DD
  createdAt: Date;
}

const BotPostSchema = new Schema(
  {
    plan: { type: String, enum: ['criminal', 'family', 'academic'], required: true, index: true },
    topic: { type: String, required: true },
    sourceUrl: String,
    sourceTitle: String,
    angle: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'failed', 'awaiting_feedback'], default: 'pending', index: true },
    feedback: String,
    version: { type: Number, default: 1 },
    article: {
      type: {
        titleEn: String,
        titleVi: String,
        descEn: String,
        descVi: String,
        slug: String,
        tags: [String],
        contentEn: String,
        contentVi: String,
        quality: Schema.Types.Mixed,
      },
    },
    coverUrl: String,
    categorySlug: { type: String, required: true },
    casestudySlug: String,
    tgChatId: String,
    tgControlMessageId: Number,
    sentAt: Date,
    publishedAt: Date,
    runDate: { type: String, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.BotPost || mongoose.model<IBotPost>('BotPost', BotPostSchema);
