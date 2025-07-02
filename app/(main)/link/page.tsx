import type { Metadata } from "next";

import LinkTitle from "@/app/ui/link-title";

export const metadata: Metadata = {
  title: "ichiyo | 友链",
};

export default function Link() {
  return (
    <>
      <LinkTitle />
    </>
  );
}
