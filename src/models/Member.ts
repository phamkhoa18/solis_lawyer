import mongoose, { Schema } from "mongoose";
import { IMember } from "@/lib/types/imember";

const MemberSchema: Schema<IMember> = new Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    position: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    image: { type: String, required: true },
    socialLinks: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Member || mongoose.model<IMember>("Member", MemberSchema);