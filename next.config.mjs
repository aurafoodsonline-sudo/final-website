/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Allows product/bundle photo uploads (up to 5 MB) from the admin panel.
    serverActions: { bodySizeLimit: "6mb" },
  },
};
export default nextConfig;
