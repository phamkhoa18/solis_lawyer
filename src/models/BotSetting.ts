import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface IBotSetting extends Document {
  key: string;
  adminChatId?: string;
  adminUserId?: string;
  adminName?: string;
}

const BotSettingSchema = new Schema(
  {
    key: { type: String, unique: true, index: true },
    adminChatId: String,
    adminUserId: String,
    adminName: String,
  },
  { timestamps: true }
);

export default mongoose.models.BotSetting || mongoose.model<IBotSetting>('BotSetting', BotSettingSchema);
