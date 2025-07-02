import type { Metadata } from "next";

import AboutTitle from "@/app/ui/about-title";
import AboutMain from "@/app/ui/about-main";

export const metadata: Metadata = {
  title: "ichiyo | 关于",
};

export default function About() {
  return (
    <>
      <AboutTitle />
      <AboutMain />
    </>
  );
}
