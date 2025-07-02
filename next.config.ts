import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    domains: ["*.ichiyo.in", "dn-qiniu-avatar.qbox.me"],
  },
};

const withNextIntl = createNextIntlPlugin("./app/i18n/request.ts");

export default withNextIntl(nextConfig);
