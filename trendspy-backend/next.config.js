/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'mongoose',
      'mongodb-memory-server',
      'mongodb-memory-server-core',
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        'mongoose',
        'mongodb-memory-server',
        'mongodb-memory-server-core',
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
