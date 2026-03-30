/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Next.js 16 uses Turbopack by default; keep empty turbopack config to suppress warning
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;
