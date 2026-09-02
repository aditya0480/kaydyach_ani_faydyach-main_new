import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header (security + tiny perf gain)

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'], // Tree-shake large packages
  },

  images: {
    unoptimized: true,
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'], // Modern formats for smaller images
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nirmantestbucket.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.kaydyachaanifaydyach.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // Cache static assets and public media aggressively
        source: '/:path*\\.(?:ico|png|jpg|jpeg|svg|webp|avif|woff|woff2|ttf|eot|webmanifest)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache favicon folder if any
        source: '/favicon/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API responses strategically
        source: '/api/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
