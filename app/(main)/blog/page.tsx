import type { Metadata } from "next";

import BlogTitle from "@/app/ui/blog-title";
import BlogMain from "@/app/ui/blog-main";

export const metadata: Metadata = {
  title: "ichiyo | 博客",
};

export default function Blog() {
  return (
    <>
      <BlogTitle />
      <BlogMain />
    </>
  );
}
