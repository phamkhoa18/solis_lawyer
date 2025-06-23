// models/Service.ts
import mongoose, { Schema } from 'mongoose';
import {IService} from '@/lib/types/iservice' ;
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
  },
  {
    timestamps: true, // tự động tạo createdAt và updatedAt
  }
);

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
