import type { Metadata } from "next";

import LinkTitle from "@/app/ui/link-title";
import LinkMain from "@/app/ui/link-main";

export const metadata: Metadata = {
  title: "ichiyo | 友链",
  description: "我的友链",
};

export default function Link() {
  return (
    <>
      <LinkTitle />
      <LinkMain />
    </>
  );
}
