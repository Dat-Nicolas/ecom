/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "via.placeholder.com",
      "images.unsplash.com",
      "picsum.photos",
      process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, ''),
    ].filter(Boolean),
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

module.exports = nextConfig;