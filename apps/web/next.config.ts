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
      {
        protocol: "https",
        hostname: "*.minio.io",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3100"],
    },
  },
};

export default nextConfig;
