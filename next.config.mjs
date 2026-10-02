/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Database drivers run on the server only.
  serverExternalPackages: ["pg", "better-sqlite3"],
  experimental: {
    // Allows product/bundle photo uploads (up to 5 MB) from the admin panel.
    serverActions: { bodySizeLimit: "6mb" },
  },
};
export default nextConfig;
