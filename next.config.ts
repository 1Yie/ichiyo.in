import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "file.ichiyo.in",
      "dn-qiniu-avatar.qbox.me",
      "images.unsplash.com",
      "iph.href.lu",
    ],
  },
  experimental: {
    reactCompiler: true,
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "info"],
          }
        : false,
  },
  async rewrites() {
    return [
      {
        source: "/rss",
        destination: "/feed.xml",
      },
      {
        source: "/rss.xml",
        destination: "/feed.xml",
      },
      {
        source: "/feed",
        destination: "/feed.xml",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/blog/:slug",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=30",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
