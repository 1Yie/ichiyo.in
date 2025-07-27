"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Tag {
  id: number;
  name: string;
  postCount: number;
}

export default function TagsMain() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/tags");
        if (!res.ok) throw new Error("获取标签失败");
        const data = await res.json();
        setTags(data.tags);
      } catch (err) {
        console.error(err);
        setError("加载标签失败");
      } finally {
        setLoading(false);
      }
    }

    fetchTags();
  }, []);

  // 过滤出postCount >= 1的标签
  const validTags = tags.filter(tag => tag.postCount >= 1);

  return (
    <div className="border-b">
      <section className="section-base p-12">
        {loading && (
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-[100px] h-8 rounded-full" />
            ))}
          </div>
        )}

        {error && (
          <span className="text-lg px-3 py-1 bg-red-100 text-red-700 rounded-full">{error}</span>
        )}

        {!loading && !error && (
          <div className="flex flex-wrap gap-2">
            {validTags.length === 0 ? (
              <span className="text-lg px-3 py-1 bg-gray-100 text-gray-700 rounded-full">暂无标签</span>
            ) : (
              validTags.map(tag => (
                <Link
                  key={tag.id}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="text-lg px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-300"
                >
                  {tag.name} ({tag.postCount})
                </Link>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
