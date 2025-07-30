"use client";

import { useState, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

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

export default function BlogSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 处理搜索
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        setError(null);
        try {
          const res = await fetch(`/api/post/search?q=${encodeURIComponent(searchQuery)}`);
          if (!res.ok) {
            throw new Error("搜索失败");
          }
          const data = await res.json();
          setSearchResults(data);
          setShowResults(true);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("搜索请求失败");
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="flex items-center border rounded-lg overflow-hidden bg-background transition-all duration-300">
          <div className="pl-2 sm:pl-3">
            <Search size={18} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* 搜索结果 */}
      {showResults && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-[300px] overflow-hidden">
          <div className="overflow-y-auto max-h-[300px]">
            {isSearching ? (
              <div className="p-3 space-y-3">
                <Skeleton className="h-5 sm:h-6 w-3/4" />
                <Skeleton className="h-5 sm:h-6 w-1/2" />
                <Skeleton className="h-5 sm:h-6 w-2/3" />
              </div>
            ) : error ? (
              <div className="p-3 text-center text-red-500 text-sm sm:text-base">{error}</div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-center text-muted-foreground text-sm sm:text-base">未找到相关文章</div>
            ) : (
              <ul className="divide-y">
                {searchResults.map((post) => (
                  <li key={post.id} className="hover:bg-muted/50 transition-colors">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block p-2 sm:p-3"
                      onClick={() => {
                        clearSearch();
                      }}
                    >
                      <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-2">{post.title}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/tags/${encodeURIComponent(tag.name)}`);
                              clearSearch();
                            }}
                          >
                            #{tag.name}
                          </span>
                        ))}
                        {post.tags.length > 5 && (
                          <span className="text-xs text-muted-foreground">+{post.tags.length - 5}个标签</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}