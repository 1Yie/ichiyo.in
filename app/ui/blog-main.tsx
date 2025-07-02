"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "../i18n/navigation";

interface Post {
  id: number;
  slug: string;
  title: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    uid: number;
    id: string;
    email: string;
  };
}

export default function BlogMain() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/post/public/?summary=true");
        if (!res.ok) throw new Error("获取文章失败");
        const data = await res.json();
        console.log("获取到的文章数据：", data);
        setPosts(data);
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
  }, []);

  if (loading || error) {
    if (error) {
      console.error("获取文章失败:", error);
    }
    return (
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
    );
  }

  return (
    <div className="border-b">
      <section className="section-base">
        <div>
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="m-0 p-0 border-b last:border-b-0">
                <Link
                  href={`/blog/${post.slug}`}
                  className="cursor-pointer block "
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/blog/${post.slug}`);
                  }}
                >
                  <div className="p-4 hover:bg-gray-50 dark:hover:bg-black transition-colors duration-300">
                    <p className="text-2xl font-semibold">{post.title}</p>
                    <div className="flex flex-row gap-2 items-center justify-start">
                      <p className="text-lg text-gray-500">
                        {post.author?.id ?? "匿名"}
                      </p>
                      <p className="text-sm text-gray-500">|</p>
                      <p className="text-lg text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
