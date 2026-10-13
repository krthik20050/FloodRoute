import type { NextConfig } from 'next';
const staticExport = process.env.FLOODROUTE_STATIC_EXPORT === '1';
const config: NextConfig = {
  output: staticExport ? 'export' : undefined,
  basePath: staticExport ? process.env.GITHUB_PAGES_BASE_PATH || '/FloodRoute' : '',
  trailingSlash: staticExport,
  poweredByHeader: false,
  devIndicators: false,
  distDir: process.env.FLOODROUTE_BUILD_DIR || '.next',
};
export default config;
