/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization for local file system images
  images: {
    unoptimized: true, // For local file system images
  },
}

module.exports = nextConfig
