import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogSlug from "@/ui/blog-slug";
import { request, baseUrl } from "@/hooks/use-request";
import type { Post, PostBySlug } from "@/types/post";
import { use } from "react";

export const dynamic = "force-dynamic";

async function fetchPost(slug: string): Promise<Post | null> {
  try {
    return await request<Post>(`/api/post/bySlug/${slug}`);
  } catch (error) {
    console.error("获取文章数据失败:", error);
    return null;
  }
}

const postCache = new Map<string, Promise<Post | null>>();

function getPost(slug: string) {
  if (!postCache.has(slug)) {
    postCache.set(slug, fetchPost(slug));
  }
  return postCache.get(slug)!;
}

function transformPost(post: Post): PostBySlug {
  return {
    ...post,
    authors: post.authors?.map(a => a.user) || [],
  };
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const post = await getPost(params.slug);
  if (!post) {
    return { title: "404 | ichiyo" };
  }
  const description = post.content.slice(0, 150) + (post.content.length > 150 ? "..." : "");
  return {
    title: `${post.title} | ichiyo`,
    description,
    keywords: post.tags.map(tag => tag.name),
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `${baseUrl}/blog/${post.slug}`,
    },
  };
}

export default function Page(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const post = use(getPost(params.slug));
  if (!post) notFound();
  const transformedPost = transformPost(post);

  return <BlogSlug post={transformedPost} htmlContent={transformedPost.content} />;
}
