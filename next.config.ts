import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    domains: ["*.ichiyo.in"],
  },
};

const withNextIntl = createNextIntlPlugin("./app/i18n/request.ts");

export default withNextIntl(nextConfig);
