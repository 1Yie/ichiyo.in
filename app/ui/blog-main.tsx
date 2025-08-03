"use client";

import { Suspense, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Tags, Rss } from "lucide-react";
import BlogSearch from "@/ui/blog-search";
import PostsList from "@/ui/posts-list";


export default function BlogMain() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <>
      <div className="border-b bg-diagonal-stripes-sm">
        <section className="section-base flex flex-col sm:flex-row sm:justify-between px-4 py-3 sm:py-1.5 gap-3 sm:gap-0">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <Link href="/tags" className="flex items-center gap-1 text-lg">
              <Tags size={19} />
              Tags
            </Link>
            <Link href="/feed.xml" className="flex items-center gap-1 text-lg">
              <Rss size={17} />
              Rss
            </Link>
          </div>
          <div className="w-full sm:w-auto sm:max-w-xs">
            <BlogSearch />
          </div>
        </section>
      </div>

      <Suspense
        fallback={
          <div className="border-b">
            <section className="section-base">
              <div className="p-4 space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="space-y-2 border-b border-gray-200 pb-4 last:border-b-0 dark:border-gray-700"
                  >
                    <Skeleton className="h-7 w-3/4 rounded-md" />
                    <Skeleton className="h-5 w-1/3 rounded-md" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        }
      >
        <PostsList currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </Suspense>
    </>
  );
}
