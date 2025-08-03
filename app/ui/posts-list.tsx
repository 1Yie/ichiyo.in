"use client";

import { use } from "react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { request } from "@/hooks/use-request";

interface Post {
  id: number;
  slug: string;
  title: string;
  tags: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
  authors: { user: { uid: number; id: string; email: string } }[];
}

const postsPerPage = 6;

const getPosts = request<Post[]>("/api/post/public?summary=true");

export default function PostsList({
  currentPage,
  setCurrentPage,
}: {
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) {
  const posts = use(getPosts);

  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  return (
    <>
      <section className="section-base">
        {paginatedPosts.length === 0 ? (
          <p className="p-4 text-center text-gray-500 dark:text-gray-400">暂无文章</p>
        ) : (
          <ul className="space-y-4">
            {paginatedPosts.map((post) => (
              <li key={post.id} className="m-0 p-0 border-b last:border-b-0">
                <Link
                  href={`/blog/${post.slug}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-black transition-colors duration-300"
                >
                  <p className="text-2xl font-semibold">{post.title}</p>
                  <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      {post.authors.length > 0
                        ? post.authors.map((author, index) => (
                          <span key={`author-${post.id}-${author.user.uid}-${index}`}>
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

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.map((tag) => (
                        <span
                          key={`tag-${post.id}-${tag.id}`}
                          className="inline-flex items-center bg-accent px-2 py-0.5 rounded-full text-sm font-medium text-accent-foreground"
                        >
                          <span className="text-accent-foreground/60 mr-1 select-none">#</span>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {totalPosts > postsPerPage && (
        <div className="border-t">
          <section className="section-base p-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else {
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
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

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages && setCurrentPage(currentPage + 1)
                    }
                    className={
                      currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </section>
        </div>
      )}
    </>
  );
}
