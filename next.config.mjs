/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || '';

const nextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  output: 'export',
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_PURCHASES_MODE: process.env.NEXT_PUBLIC_PURCHASES_MODE || 'real'
  }
};

export default nextConfig;
