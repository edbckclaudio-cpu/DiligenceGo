/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || '';
const isExport = process.env.NEXT_OUTPUT === 'export';

const nextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  ...(isExport ? { output: 'export', trailingSlash: true } : {})
};

export default nextConfig;
