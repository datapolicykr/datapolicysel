import type { NextConfig } from "next";

const RAW="https://raw.githubusercontent.com/datapolicykr/datapolicysel/main/public";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/options/:path*", destination: `${RAW}/options/:path*` },
      { source: "/osstem-roundel-transparent.png", destination: `${RAW}/osstem-roundel-transparent.png` },
      { source: "/osstem-wordmark-transparent.png", destination: `${RAW}/osstem-wordmark-transparent.png` },
      { source: "/favicon.svg", destination: `${RAW}/favicon.svg` }
    ];
  }
};

export default nextConfig;
