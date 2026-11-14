import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.121"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
