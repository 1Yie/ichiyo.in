"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Comments from "@/components/ui/comment";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import ErrorBoundary from "@/ui/error-boundary";
import type { PostBySlug } from "@/types/post";

function dayDiff(d1: Date, d2: Date) {
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor(
    (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function timeDiffText(
  createdAt: string,
  updatedAt: string,
  post: PostBySlug,
  htmlContent: string
) {
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);
  const now = new Date();

  const createdDiffDays = dayDiff(created, now);
  const updatedDiffDays = dayDiff(updated, now);

  const textContent = htmlContent.replace(/<[^>]*>/g, "").replace(/\s+/g, "");
  const wordCount = textContent.length;

  const formatDate = (d: Date) =>
    `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

  const formatDateShort = (d: Date) =>
    `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;

  const createdText =
    createdDiffDays <= 7
      ? createdDiffDays === 0
        ? "今天"
        : `${createdDiffDays} 天前`
      : formatDateShort(created);

  const updatedText =
    updatedDiffDays <= 7
      ? updatedDiffDays === 0
        ? "今天"
        : `${updatedDiffDays} 天前`
      : formatDateShort(updated);

  const isUpdated = updated.getTime() > created.getTime();
  const showUpdated = isUpdated && createdText !== updatedText;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="inline-flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 cursor-pointer">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{createdText}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>创建于 {formatDate(created)}</TooltipContent>
          </Tooltip>

          {showUpdated && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>{updatedText}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>更新于 {formatDate(updated)}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>文章 Meta</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                标题
              </div>
              <div className="text-base font-semibold">{post.title}</div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                作者
              </div>
              <div className="text-sm">
                {post.authors && post.authors.length > 0
                  ? post.authors.map((a) => a.id).join(", ")
                  : "匿名"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  创建时间
                </div>
                <div className="text-sm font-mono">{formatDate(created)}</div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  更新时间
                </div>
                <div className="text-sm font-mono">
                  {Math.abs(updated.getTime() - created.getTime()) < 60 * 1000
                    ? "-"
                    : formatDate(updated)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                文章字数
              </div>
              <div className="text-sm">{wordCount.toLocaleString()} 字</div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  标签
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${encodeURIComponent(tag.name)}`}
                      className="inline-flex items-center bg-accent hover:bg-accent/80 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span className="text-muted-foreground mr-1">#</span>
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Slug
              </div>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/blog/${post.slug}`;
                  navigator.clipboard.writeText(url).then(() => {
                    toast.success("链接已复制到剪贴板");
                  });
                }}
                className="text-xs font-mono text-muted-foreground break-all bg-muted/50 hover:bg-muted px-2 py-1.5 rounded transition-colors text-left cursor-pointer"
              >
                {post.slug}
              </button>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                版权说明
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                <p>
                  本文采用{" "}
                  <a
                    href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:underline cursor-pointer"
                  >
                    CC BY-NC-SA 4.0
                  </a>{" "}
                  协议
                </p>
                <p>转载请注明出处并保留原文链接</p>
              </div>
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>关闭</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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

function PostContent({
  post,
  htmlContent,
}: {
  post: PostBySlug;
  htmlContent: string;
}) {
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

          <h1 className="sm:text-4xl text-3xl font-bold mt-2 mb-2">
            {post.title}
          </h1>
          <p className="text-gray-600 text-lg sm:text-2xl mb-3 dark:text-gray-300">
            {post.authors && post.authors.length > 0
              ? post.authors.map((a) => a.id).join(", ")
              : "匿名"}
          </p>

          {timeDiffText(post.createdAt, post.updatedAt, post, htmlContent)}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="inline-flex items-center bg-accent px-3 py-1 rounded-full text-sm font-medium text-accent-foreground cursor-pointer hover:bg-accent/80 transition"
                >
                  <span className="text-accent-foreground/60 mr-1 select-none">
                    #
                  </span>
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
