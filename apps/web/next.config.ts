import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@visualapp/database"],

  images: {
    remotePatterns: [
      // Local dev — MinIO
      {
        protocol: "http",
        hostname: "localhost",
        port: "9100",
        pathname: "/**",
      },
      // Produção — MinIO externo ou S3
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
        "localhost:3100",
        // Produção — preenchido via env
        ...(process.env.NEXT_PUBLIC_APP_URL
          ? [new URL(process.env.NEXT_PUBLIC_APP_URL).host]
          : []),
      ],
    },
  },

  // Necessário para Vercel + monorepo
  output: undefined, // 'standalone' só quando necessário
};

export default nextConfig;
