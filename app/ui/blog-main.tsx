"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Tags, Rss } from "lucide-react";
import BlogSearch from "./blog-search";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Post {
  id: number;
  slug: string;
  title: string;
  tags: {
    id: number;
    name: string;
  }[];
  createdAt: string;
  updatedAt: string;
  authors: {
    user: {
      uid: number;
      id: string;
      email: string;
    };
  }[];
}

export default function BlogMain() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 6;
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/post/public?summary=true");
        if (!res.ok) throw new Error("获取文章失败");
        const data = await res.json();
        setTotalPosts(data.length);

        // 计算当前页的文章
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = data.slice(startIndex, endIndex);

        setPosts(paginatedPosts);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("请求错误");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [currentPage]);

  if (loading || error) {
    if (error) console.error("获取文章失败:", error);
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
      </>
    );
  }

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
      <div className="border-b">
        <section className="section-base">
          <div>
            {posts.length === 0 ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                暂无文章
              </p>
            ) : (
              <ul className="space-y-4">
                {posts.map((post) => (
                  <li key={post.id} className="m-0 p-0 border-b last:border-b-0">
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-black transition-colors duration-300">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="cursor-pointer block"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/blog/${post.slug}`);
                        }}
                      >
                        <p className="text-2xl font-semibold">{post.title}</p>
                        <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                          <p className="text-lg text-gray-500 dark:text-gray-400">
                            {post.authors.length > 0
                              ? post.authors.map((author, index) => (
                                <span
                                  key={`author-${post.id}-${author.user.uid}-${index}`}
                                >
                                  {index > 0 && ", "}
                                  {author.user.id}
                                </span>
                              ))
                              : "匿名"}
                          </p>
                          <p className="text-lg text-gray-500 dark:text-gray-600">·</p>
                          <p className="text-lg text-gray-500 dark:text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.tags.map((tag) => (
                            <Link
                              key={`tag-${post.id}-${tag.id}`}
                              href={`/tags/${encodeURIComponent(tag.name)}`}
                              className="inline-flex items-center bg-accent px-2 py-0.5 rounded-full text-sm font-medium text-accent-foreground cursor-pointer hover:bg-accent/80 transition"
                            >
                              <span className="text-accent-foreground/60 mr-1 select-none">
                                #
                              </span>
                              {tag.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 分页组件 */}
        {totalPosts > postsPerPage && (
          <div className="border-t">
            <section className="section-base p-3">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {/* 生成页码 */}
                  {Array.from({ length: Math.min(5, Math.ceil(totalPosts / postsPerPage)) }).map((_, i) => {
                    // 计算要显示的页码
                    let pageNum;
                    const totalPages = Math.ceil(totalPosts / postsPerPage);

                    if (totalPages <= 5) {
                      // 如果总页数小于等于5，直接显示1到totalPages
                      pageNum = i + 1;
                    } else {
                      // 如果总页数大于5，需要根据当前页计算显示哪些页码
                      if (currentPage <= 3) {
                        // 当前页靠近开始，显示1-5
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        // 当前页靠近结束，显示最后5页
                        pageNum = totalPages - 4 + i;
                      } else {
                        // 当前页在中间，显示当前页及其前后2页
                        pageNum = currentPage - 2 + i;
                      }
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {/* 如果总页数大于5且当前页不在最后3页，显示省略号和最后一页 */}
                  {Math.ceil(totalPosts / postsPerPage) > 5 && currentPage < Math.ceil(totalPosts / postsPerPage) - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(Math.ceil(totalPosts / postsPerPage))}
                          className="cursor-pointer"
                        >
                          {Math.ceil(totalPosts / postsPerPage)}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalPosts / postsPerPage)))}
                      className={currentPage === Math.ceil(totalPosts / postsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

            </section>
          </div>
        )}
      </div>
    </>
  );
}
