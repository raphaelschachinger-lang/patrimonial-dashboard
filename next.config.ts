import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build de production autonome (node_modules réduits) — utilisé par le Dockerfile.
  output: "standalone",
};

export default nextConfig;
