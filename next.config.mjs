/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com', // For favicons
      },
    ],
  },
  // Ensure strict mode is on for better debugging
  reactStrictMode: true,
  // Force reload for new deps
};

export default nextConfig;
