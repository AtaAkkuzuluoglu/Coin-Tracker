import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone mode for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/simplr-sh/coin-logos/**",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
