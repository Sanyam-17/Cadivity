import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: '/dashboard/admin/:path*',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/dashboard/admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
