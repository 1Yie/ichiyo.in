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
};

export default nextConfig;
