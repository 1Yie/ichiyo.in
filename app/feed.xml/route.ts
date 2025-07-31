import RSS from "rss";
import prisma from "@/lib/prisma";
import { parseMarkdownForFeed } from "@/lib/markdown";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const feed = new RSS({
    title: "ichiyo | 博客",
    description: "ichiyo 的个人博客",
    site_url: baseUrl,
    feed_url: baseUrl + "/feed.xml",
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
      tags: {
        select: {
          name: true,
        },
      },
      content: true,
      updatedAt: true,
    },
  });

  for (const post of posts) {
    const html = await parseMarkdownForFeed(post.content);

    feed.item({
      title: post.title,
      url: `${baseUrl}/blog/${post.slug}`,
      guid: post.slug,
      date: post.updatedAt,
      categories: post.tags.map((tag) => tag.name),
      description: html,
    });
  }

  return new Response(feed.xml(), {
    headers: { "content-type": "application/xml" },
  });
}
