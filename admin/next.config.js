/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18next.config');

// const runtimeCaching = require('next-pwa/cache');
// const withPWA = require('next-pwa')({
//   disable: process.env.NODE_ENV === 'development',
//   dest: 'public',
//   runtimeCaching,
// });

const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    domains: [
      '127.0.0.1:8000',
      'via.placeholder.com',
      'res.cloudinary.com',
      's3.amazonaws.com',
      '127.0.0.1',
      'localhost',
      'picsum.photos',
      'pixarlaravel.s3.ap-southeast-1.amazonaws.com',
      'pickbazarlaravel.s3.ap-southeast-1.amazonaws.com',
      'lh3.googleusercontent.com',
      '127.0.0.1:8000',
      '192.168.102.61',
      '192.168.102.28',
      '192.168.102.22',
      'tomirupdf.sgp1.vultrobjects.com',
      'tomirumedia.sgp1.vultrobjects.com',
    ],
  },
  ...(process.env.APPLICATION_MODE === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
};

module.exports = nextConfig;