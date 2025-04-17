import type { NextConfig } from "next";

// For Electron, we'll use a static export
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
};

export default nextConfig;
