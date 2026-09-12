import type { NextConfig } from "next";

const mediaHostname = process.env.NEXT_PUBLIC_MEDIA_HOSTNAME;
if (!mediaHostname) throw new Error("NEXT_PUBLIC_MEDIA_HOSTNAME is not configured.");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: mediaHostname },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
