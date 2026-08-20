import mongoose, { Schema } from 'mongoose';
import type { Document } from 'mongoose';

export interface IBotSetting extends Document {
  key: string;
  adminChatId?: string;
  adminUserId?: string;      // comma-separated user IDs
  adminName?: string;
  cronEnabled?: boolean;      // bật/tắt cron tự động
  cronHour?: number;          // giờ chạy (default 7)
  cronMinute?: number;        // phút chạy (default 0)
  aiModel?: string;           // model mặc định
  autoCover?: boolean;        // tạo ảnh bìa tự động
  articleLength?: 'short' | 'medium' | 'long';
}

const BotSettingSchema = new Schema(
  {
    key: { type: String, unique: true, index: true },
    adminChatId: String,
    adminUserId: String,
    adminName: String,
    cronEnabled: { type: Boolean, default: true },
    cronHour: { type: Number, default: 7 },
    cronMinute: { type: Number, default: 0 },
    aiModel: { type: String, default: 'DeepSeek-V4-Flash' },
    autoCover: { type: Boolean, default: true },
    articleLength: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
  },
  { timestamps: true }
);

export default mongoose.models.BotSetting || mongoose.model<IBotSetting>('BotSetting', BotSettingSchema);
