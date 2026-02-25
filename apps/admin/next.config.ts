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
        hostname: process.env.MINIO_PUBLIC_HOST || "storage.visualfashionkids.com.br",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3110",
        ...(process.env.NEXT_PUBLIC_ADMIN_URL
          ? [new URL(process.env.NEXT_PUBLIC_ADMIN_URL).host]
          : []),
      ],
    },
  },
};

export default nextConfig;
