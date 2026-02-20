/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || '';
const isVercel = process.env.VERCEL === '1';
const isExport = process.env.NEXT_OUTPUT === 'export' && !isVercel;

const nextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  ...(isExport ? { output: 'export', trailingSlash: true } : {}),
  env: {
    NEXT_PUBLIC_PURCHASES_MODE: process.env.NEXT_PUBLIC_PURCHASES_MODE || 'real'
  }
};

export default nextConfig;
