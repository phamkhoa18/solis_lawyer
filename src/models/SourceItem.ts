import mongoose, { Schema } from 'mongoose';

export interface ISourceItem extends Document {
  link: string;
  sourceId: string;
  sourceName: string;
  title: string;
  snippet?: string;
  pubDate?: string;
  status: 'new' | 'dismissed';
  createdAt: Date;
}

const SourceItemSchema = new Schema(
  {
    link: { type: String, required: true, unique: true, index: true },
    sourceId: { type: String, required: true },
    sourceName: { type: String, required: true },
    title: { type: String, required: true },
    snippet: { type: String },
    pubDate: { type: String },
    status: { type: String, enum: ['new', 'dismissed'], default: 'new', index: true },
  },
  { timestamps: true }
);

export default mongoose.models.SourceItem || mongoose.model<ISourceItem>('SourceItem', SourceItemSchema);
