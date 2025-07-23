import { notFound } from "next/navigation";
import TagsParamsTitle from "@/app/ui/tags-params-title";
import TagParams from "@/app/ui/tags-params-main";

interface Post {
  id: number;
  slug: string;
  title: string;
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

export default async function TagPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const tagName = decodeURIComponent(name);

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/tags/${encodeURIComponent(tagName)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return notFound();
  }

  const data: TagData = await res.json();

  return (
    <>
      <TagsParamsTitle title={data.tag.name} />
      <TagParams data={data} />
    </>
  );
}
