import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    uid: number;
  };
}

// 动态设置页面标题
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const res = await fetch(`http://localhost:3000/api/post/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return {
      title: "文章未找到",
    };
  }

  const post = await res.json();
  return {
    title: post.title,
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const res = await fetch(`http://localhost:3000/api/post/${params.slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    notFound();
  }

  const post: Post = await res.json();

  return (
    <article className="prose lg:prose-xl mx-auto py-8">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-gray-500 text-sm">
        作者：{post.author?.id} ｜ 发布时间：{new Date(post.createdAt).toLocaleDateString()}
      </p>
      <div className="mt-6 leading-relaxed whitespace-pre-line">{post.content}</div>
    </article>
  );
}
