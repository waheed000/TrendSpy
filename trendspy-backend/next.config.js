/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'mongoose'];
    return config;
  },
};

module.exports = nextConfig;
