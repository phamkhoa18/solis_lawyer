import mongoose, { Model, Schema } from 'mongoose';
import { IPost } from '@/lib/types/ipost';

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: Schema.Types.ObjectId, ref: 'Type' },
    tags: [{ type: String, trim: true }],
    featuredImage: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    viewsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;
