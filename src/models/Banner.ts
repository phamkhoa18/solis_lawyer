import mongoose, { Schema } from "mongoose";
import {IBanner} from '@/lib/types/iBanner' ;

const BannerSchema: Schema<IBanner> = new Schema(
  {
    image: { type: String, required: true },
    name: {
      en: { type: String, required: true },
      vi: { type: String, required: true }
    },
    description: {
      en: { type: String },
      vi: { type: String }
    },
    buttonText: {
      en: { type: String },
      vi: { type: String }
    },
    link: { type: String },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);