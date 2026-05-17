/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      'mongoose',
      'bcryptjs',
      'slugify',
      'mongodb-memory-server',
      'mongodb-memory-server-core',
      'cheerio',
      'axios',
      'puppeteer',
      'google-trends-api',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        'mongoose',
        'bcryptjs',
        'slugify',
        'mongodb-memory-server',
        'mongodb-memory-server-core',
        'cheerio',
        'axios',
        'puppeteer',
        'google-trends-api',
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
