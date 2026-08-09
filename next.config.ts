import type { NextConfig } from "next";

// Standalone output required for Docker production images.
// Web deploys (Vercel) leave this undefined = default SSR behavior.
const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
};

export default nextConfig;
