import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogSlug from "@/ui/blog-slug";
import { request, baseUrl } from "@/hooks/use-request";
import type { Post } from "@/types/post";

export const dynamic = "auto";

async function fetchPost(slug: string): Promise<Post | null> {
  try {
    return await request<Post>(`/api/post/bySlug/${slug}`);
  } catch (error) {
    console.error("获取文章数据失败:", error);
    return null;
  }
}

export async function generateMetadata(
  props: {
    params: Promise<{ slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const post = await fetchPost(params.slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title + " | ichiyo",
    description: post.content.slice(0, 150) + (post.content.length > 150 ? '...' : ''),
    keywords: post.tags.map((tag: { name: string }) => tag.name),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 150) + (post.content.length > 150 ? '...' : ''),
      type: "article",
      url: `${baseUrl}/blog/${post.slug}`,
    },
  };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await fetchPost(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogSlug params={{ slug: params.slug }} />;
}