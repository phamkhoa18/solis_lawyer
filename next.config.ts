import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    domains: ["solislaw.com.au", "res.cloudinary.com"], // <-- thêm dòng này
  },
};

export default nextConfig;
