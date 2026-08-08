import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/pricing-preview",
        destination: "/pricing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
