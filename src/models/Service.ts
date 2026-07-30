// models/Service.ts
import mongoose, { Schema } from 'mongoose';
import { IService } from '@/lib/types/iservice';

const ServiceSchema: Schema = new Schema<IService>(
  {
    name: {
      en: { type: String, required: true },
      vi: { type: String, required: true },
    },
    img: { type: String, required: true }, // link ảnh
    link: { type: String, required: true }, // URL dịch vụ
    description: {
      en: { type: String, required: true },
      vi: { type: String, required: true },
    },
    icon: { type: String }, // link ảnh icon
    benefits: {
      en: [{ type: String }],
      vi: [{ type: String }],
    },
    team: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
  },
  {
    timestamps: true, // tự động tạo createdAt và updatedAt
  }
);

if (mongoose.models.Service) {
  delete mongoose.models.Service;
}
export default mongoose.model<IService>('Service', ServiceSchema);
