"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Comments from "@/components/ui/comment";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ErrorBoundary from "@/ui/error-boundary";
import type { PostBySlug } from "@/types/post";

function dayDiff(d1: Date, d2: Date) {
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function timeDiffText(createdAt: string, updatedAt: string) {
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);
  const now = new Date();

  const createdDiffDays = dayDiff(created, now);
  const updatedDiffDays = dayDiff(updated, now);

  const formatDate = (d: Date) =>
    `${d.getFullYear()}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;

  const createdText =
    createdDiffDays <= 7
      ? createdDiffDays === 0
        ? "今天"
        : `${createdDiffDays} 天前`
      : formatDate(created);

  const updatedText =
    updatedDiffDays <= 7
      ? updatedDiffDays === 0
        ? "今天"
        : `${updatedDiffDays} 天前`
      : formatDate(updated);

  const isUpdated = updated.getTime() > created.getTime();
  const showUpdated = isUpdated && createdText !== updatedText;

  return (
    <div className="inline-block text-gray-500 text-sm sm:text-lg dark:text-gray-400">
      <div>
        <Tooltip>
          <TooltipTrigger>创建于 {createdText}</TooltipTrigger>
          <TooltipContent>创建于 {formatDate(created)}</TooltipContent>
        </Tooltip>
      </div>
      {showUpdated && (
        <div>
          <Tooltip>
            <TooltipTrigger>更新于 {updatedText}</TooltipTrigger>
            <TooltipContent>更新于 {formatDate(updated)}</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="border-b">
      <section className="section-base p-12">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-5 w-1/6" />
        </div>
      </section>
      <section className="section-base px-[120px] py-[20px] max-[768px]:px-[20px] max-[768px]:py-[30px]">
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}

function PostContent({ post, htmlContent }: { post: PostBySlug; htmlContent: string }) {
  
  return (
    <>
      <div className="border-b">
        <section className="section-base p-12 bg-squares relative">
          <div className="absolute top-0 right-full max-[768px]:hidden">
            <button
              className="flex items-center justify-center w-10 h-10 border-l border-b cursor-pointer"
              onClick={() => window.history.back()}
              title="返回"
            >
              <p className="text-muted-foreground">
                <ChevronLeft className="w-6 h-6" />
              </p>
            </button>
          </div>

          <h1 className="sm:text-4xl text-3xl font-bold mt-2 mb-2">{post.title}</h1>
          <p className="text-gray-600 text-lg sm:text-2xl mb-3 dark:text-gray-300">
            {post.authors && post.authors.length > 0
              ? post.authors.map((a) => a.id).join(", ")
              : "匿名"}
          </p>

          {timeDiffText(post.createdAt, post.updatedAt)}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="inline-flex items-center bg-accent px-3 py-1 rounded-full text-sm font-medium text-accent-foreground cursor-pointer hover:bg-accent/80 transition"
                >
                  <span className="text-accent-foreground/60 mr-1 select-none">#</span>
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="border-b">
        <section className="section-base">
          <div
            className="post-style max-[768px]:px-[20px] max-[768px]:py-[30px] py-[20px] px-[120px] leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: htmlContent.replace(/<img/g, '<img data-zoom="true"'),
            }}
          />
        </section>
      </div>

      <div className="border-b">
        <section className="section-base p-[50px_120px] max-[768px]:p-[20px_30px] artalk">
          <Comments />
        </section>
      </div>
    </>
  );
}

export default function BlogSlug({
  post,
  htmlContent,
}: {
  post: PostBySlug;
  htmlContent: string;
}) {
  
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ErrorBoundary fallback={null}>
        <PostContent post={post} htmlContent={htmlContent} />
      </ErrorBoundary>
    </Suspense>
  );
}
