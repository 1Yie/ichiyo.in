import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogSlug from "@/ui/blog-slug";
import { request, baseUrl } from "@/hooks/use-request";
import type { Post } from "@/types/post";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const realParams = await params;

  const res = request<Post>(`/api/post/bySlug/${realParams.slug}`, {
    next: { revalidate: 60 },
  });


  const post = await res;
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

async function getPostData(slug: string): Promise<Post> {
  try {
    const post = await request<Post>(`/api/post/bySlug/${slug}`, {
      cache: "no-store",
    });
    return post;
  } catch (error) {
    if (error instanceof Error) {
      notFound();
    }
    throw error;
  }
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const realParams = await params;

  const post = await getPostData(realParams.slug);
  if (!post) {
    notFound();
  }

  return <BlogSlug params={{ slug: realParams.slug }} />;
}