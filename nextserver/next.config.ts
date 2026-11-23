import type { NextConfig } from "next";
import { loadEnvFile } from "./lib/env";

loadEnvFile();

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ['192.168.1.*',"localhost"],
  serverExternalPackages: ["mysql2", "nodemailer", "google-auth-library"],
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
