import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Redirect non-www -> www
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "cadivity.com",
          },
        ],
        destination: "https://www.cadivity.com/:path*",
        permanent: true,
      },

      {
        source: "/admin/:path*",
        destination: "/dashboard/admin/:path*",
        permanent: true,
      },
      {
        source: "/admin",
        destination: "/dashboard/admin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;