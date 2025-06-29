"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/post?summary=true");
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

  if (loading) return <p>加载中...</p>;
  if (error) return <p className="text-red-600">错误：{error}</p>;
  if (posts.length === 0) return <p>暂无文章</p>;

  return (
    <section className="section-base">
      <ul>
        {posts.map((post) => (
          <li key={post.id} className="mb-4">
            <a
              href={`/blog/${post.slug}`}
              className="text-lg font-semibold text-blue-600 hover:underline"
            >
              {post.title}
            </a>
            <p className="text-sm text-gray-500">
              作者：{post.author?.id ?? "匿名"} ｜ 发布时间：
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
