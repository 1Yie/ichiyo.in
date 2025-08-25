"use client";

import { useState, Suspense, use } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { request } from "@/hooks/use-request";
import ErrorBoundary from "@/ui/error-boundary";
import type { Post } from "@/types/post";
import { debouncePromise } from "@/lib/debounce";

// 原始请求函数
function fetchSearchResults(query: string): Promise<Post[]> {
  if (!query.trim()) return Promise.resolve([]);
  return request<Post[]>(`/api/post/search`, {
    params: { q: query },
  });
}

// 包装成防抖版本
const debouncedFetchSearchResults = debouncePromise(fetchSearchResults, 500);

function SearchResults({ searchPromise }: { searchPromise: Promise<Post[]> }) {
  const router = useRouter();
  const searchResults = use(searchPromise);

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">暂无搜索结果</p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {searchResults.map((post) => (
        <li key={post.id} className="hover:bg-muted/50 transition-colors">
          <Link href={`/blog/${post.slug}`} className="block p-2 sm:p-3">
            <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {post.authors.map((author) => author.id).join(" · ")}
            </p>
            <div className="flex flex-wrap gap-1 my-1">
              {post.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/tags/${encodeURIComponent(tag.name)}`);
                  }}
                >
                  #{tag.name}
                </span>
              ))}
              {post.tags.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{post.tags.length - 5}个标签
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function BlogSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPromise, setSearchPromise] = useState<Promise<Post[]>>(
    Promise.resolve([])
  );
  const [showResults, setShowResults] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.trim().length > 0);

    if (value.trim()) {
      setSearchPromise(debouncedFetchSearchResults(value));
    } else {
      setSearchPromise(Promise.resolve([]));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    setSearchPromise(Promise.resolve([]));
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="flex items-center border rounded-lg overflow-hidden bg-background transition-all duration-300 hover:border-foreground/50 focus-within:border-foreground/50">
          <div className="pl-2 sm:pl-3">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="搜索文章 标题 / 内容 / 标签"
            className="w-full py-2 placeholder:text-muted-foreground placeholder:text-sm sm:py-2 px-2 text-sm sm:text-base outline-none bg-transparent"
          />
          <div
            className={cn(
              "transition-all duration-300 overflow-hidden flex items-center",
              searchQuery ? "w-[40px]" : "w-0"
            )}
          >
            <button
              onClick={clearSearch}
              className="text-muted-foreground cursor-pointer hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {showResults && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-[300px] overflow-hidden">
          <div className="overflow-y-auto max-h-[300px]">
            <Suspense
              fallback={
                <div className="p-3 space-y-3">
                  <Skeleton className="h-5 sm:h-6 w-3/4" />
                  <Skeleton className="h-5 sm:h-6 w-1/2" />
                  <Skeleton className="h-5 sm:h-6 w-2/3" />
                </div>
              }
            >
              <ErrorBoundary
                fallback={
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">搜索失败</p>
                  </div>
                }
              >
                <SearchResults searchPromise={searchPromise} />
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
