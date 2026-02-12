/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH || '';
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true
};

export default nextConfig;
