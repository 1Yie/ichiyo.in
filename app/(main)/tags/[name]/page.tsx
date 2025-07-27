import { notFound } from "next/navigation";
import TagsParamsTitle from "@/app/ui/tags-params-title";
import TagParams from "@/app/ui/tags-params-main";
import type { Metadata } from "next";

interface Post {
  id: number;
  slug: string;
  title: string;
  tags: {
    id: number;
    name: string;
  }[];
  createdAt: string;
  authors: {
    user: {
      uid: number;
      id: string;
      email: string;
    };
  }[];
}

interface TagData {
  tag: { id: number; name: string };
  posts: Post[];
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

// ➤ 动态设置页面 metadata
export async function generateMetadata({
  params,
}: {
  params: { name: string };
}): Promise<Metadata> {
  const tagName = decodeURIComponent(params.name);

  const res = await fetch(`${baseUrl}/api/tags/${encodeURIComponent(tagName)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      title: "ichiyo | 404  ",
    };
  }

  const data: TagData = await res.json();

  return {
    title: `ichiyo | ${data.tag.name}`,
  };
}

export default async function TagPage({
  params,
}: {
  params: { name: string };
}) {
  const tagName = decodeURIComponent(params.name);

  const res = await fetch(`${baseUrl}/api/tags/${encodeURIComponent(tagName)}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const data: TagData = await res.json();

  return (
    <>
      <TagsParamsTitle title={data.tag.name} />
      <TagParams data={data} />
    </>
  );
}
