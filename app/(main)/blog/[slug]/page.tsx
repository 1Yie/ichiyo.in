import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogSlug from "@/ui/blog-slug";

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

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_API_BASE_URL;

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const realParams = await params;

  const res = await fetch(`${baseUrl}/api/post/bySlug/${realParams.slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return { title: "404 | ichiyo" };
  }

  const post = await res.json();
  return {
    title: post.title + " | ichiyo",
  };
}

async function getPostData(slug: string): Promise<Post | null> {
  const res = await fetch(`${baseUrl}/api/post/bySlug/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const realParams = await params;

  const post = await getPostData(realParams.slug);
  if (!post) {
    notFound();
  }

  return <BlogSlug params={{ slug: realParams.slug }} />;
}
