import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  // /api/post/search?q=
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  
  if (!query) {
    return NextResponse.json({ error: "搜索关键词不能为空" }, { status: 400 });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        AND: [
          { published: true },
          {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
              { tags: { some: { name: { contains: query } } } }
            ]
          }
        ]
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        authors: {
          select: {
            user: {
              select: {
                uid: true,
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("搜索文章失败:", error);
    return NextResponse.json({ error: "搜索文章失败" }, { status: 500 });
  }
}