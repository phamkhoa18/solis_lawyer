import mongoose, { Schema } from 'mongoose';

export interface IAiUsage extends Document {
  model: string;
  kind: 'chat' | 'embedding';
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  estimated: boolean;
  createdAt: Date;
}

const AiUsageSchema = new Schema(
  {
    model: { type: String, required: true, index: true },
    kind: { type: String, enum: ['chat', 'embedding'], default: 'chat' },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    costUsd: { type: Number, default: 0 },
    estimated: { type: Boolean, default: false },
  },
  { timestamps: true, capped: false }
);

AiUsageSchema.index({ createdAt: -1 });

export default mongoose.models.AiUsage || mongoose.model<IAiUsage>('AiUsage', AiUsageSchema);
