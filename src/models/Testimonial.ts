import mongoose, { Schema } from "mongoose";
import {ITestimonial} from '@/lib/types/itestimonial' ;

const TestimonialSchema: Schema = new Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    image: { type: String, required: true, trim: true },
    content: {
      en: { type: String, required: true, trim: true },
      vi: { type: String, required: true, trim: true },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);