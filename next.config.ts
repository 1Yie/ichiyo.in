import type { NextConfig } from "next";
import { join } from "path";
import { writeFileSync } from "fs";

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
  webpack(config, { isServer }) {
    if (!isServer) {
      const version = new Date().toISOString().replace(/[:.-]/g, "");
      const filePath = join(__dirname, "public", "version.json");
      // const content = JSON.stringify({ version, timestamp: Date.now() });
       const content = JSON.stringify({ version });

      writeFileSync(filePath, content, "utf-8");
    }

     return config;
  },
};

export default nextConfig;
