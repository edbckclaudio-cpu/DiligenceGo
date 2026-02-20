import path from 'path';
/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || '';

const nextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  output: 'export',
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = path.resolve(process.cwd());
    return config;
  },
  env: {
    NEXT_PUBLIC_PURCHASES_MODE: process.env.NEXT_PUBLIC_PURCHASES_MODE || 'real'
  }
};

export default nextConfig;
