import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build de production autonome (node_modules réduits) — utilisé par le Dockerfile
  // pour l'auto-hébergement. Vercel a son propre packaging serverless et casse
  // (ENOENT next-server.js.nft.json) si "standalone" est forcé — donc uniquement
  // hors Vercel (process.env.VERCEL n'est défini que dans son environnement de build).
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
