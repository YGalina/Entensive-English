import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Монорепо: общие TS-пакеты воркспейса Next транспилирует сам
  // (см. node_modules/next/dist/docs — transpilePackages).
  transpilePackages: ["@ie/core", "@ie/tokens"],
};

export default nextConfig;
