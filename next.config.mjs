/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA Configuration
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Enable PWA features
  experimental: {
    optimizeCss: true,
  },

  // Optimize images for PWA
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression for better performance
  compress: true,

  // Enable static optimization
  trailingSlash: false,

  // Security headers for PWA
  async rewrites() {
    return [
      {
        source: "/sw.js",
        destination: "/sw.js",
      },
    ];
  },
};

export default nextConfig;
