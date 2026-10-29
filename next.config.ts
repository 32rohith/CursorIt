import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/project/:id/documentation",
        destination: "/project/:id/docs",
        permanent: true,
      },
      {
        source: "/api/documentation/:path*",
        destination: "/api/docs/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
