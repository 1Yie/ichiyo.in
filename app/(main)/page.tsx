import type { Metadata } from "next";
import Home from "@/app/ui/home-title";
// import HomeProject from "@/app/ui/home-project";

export const metadata: Metadata = {
  title: "ichiyo (@1Yie)",
  description: "Hi! I am ichiyo",
};

export default function HomePage() {
  return (
    <>
      <Home />
      {/* <HomeProject /> */}
    </>
  );
}
