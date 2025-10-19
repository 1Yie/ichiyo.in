import type { Metadata } from "next";
import Home from "@/app/ui/home-title";
// import HomeProject from "@/app/ui/home-project";

export const metadata: Metadata = {
  title: "ichiyo (@1Yie)"
};

export default function HomePage() {
  return (
    <>
      <Home />
      {/* <HomeProject /> */}
    </>
  );
}
