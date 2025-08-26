/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",       // ✅ enables static export
  experimental: {
    serverActions: false
  }
};

module.exports = nextConfig;
