import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "file.ichiyo.in",
      "dn-qiniu-avatar.qbox.me",
      "images.unsplash.com",
    ],
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
