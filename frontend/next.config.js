/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.imgur.com' }
    ],
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.102.1'],
  reactStrictMode: true,
};

module.exports = nextConfig;
