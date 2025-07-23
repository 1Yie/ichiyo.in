import RSS from "rss";
import prisma from "@/lib/prisma";

export async function GET() {
  const feed = new RSS({
    title: "ichiyo | 博客",
    description: "ichiyo 的个人博客",
    site_url: "https://ichiyo.in",
    feed_url: "https://ichiyo.in/feed.xml",
    language: "zh-CN",
    copyright: "ichiyo",
    generator: "Next.js",
  });

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    select: {
      title: true,
      slug: true,
      content: true,
      updatedAt: true,
    },
  });

  posts.forEach((post) => {
    const plainText = post.content.replace(/<[^>]*>/g, "");
    feed.item({
      title: post.title,
      url: `https://ichiyo.in/blog/${post.slug}`,
      guid: post.slug,
      date: post.updatedAt,
      description: plainText.slice(0, 200) + "...",
    });
  });

  return new Response(feed.xml(), {
    headers: { "content-type": "application/xml" },
  });
}
