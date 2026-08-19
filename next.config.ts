import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native modules — để Next load runtime thay vì bundle (fix Turbopack + resvg/sharp)
  serverExternalPackages: ['sharp', '@resvg/resvg-js', 'node-cron', 'sanitize-html'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'solislaw.com.au',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/local-files/:path*',
      },
    ];
  },
};

export default nextConfig;
