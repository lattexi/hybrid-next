import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "media2.edu.metropolia.fi",
      },
    ],
  },
};

export default nextConfig;
