import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@visualapp/database"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9100",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3110"],
    },
  },
};

export default nextConfig;
