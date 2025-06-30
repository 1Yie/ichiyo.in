import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { generateSlug } from "@/lib/slug";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let payload = null;
  if (token) {
    try {
      payload = verifyToken(token);
    } catch {
      payload = null;
    }
  }

  const { searchParams } = new URL(request.url);
  const summary = searchParams.get("summary") === "true";

  let posts;

  const baseQuery = {
    orderBy: { id: "desc" } as const,
    ...(summary
      ? {
          select: {
            id: true,
            slug: true,
            title: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                uid: true,
                id: true,
                email: true,
              },
            },
          },
        }
      : undefined),
  };

  if (payload) {
    // 登录用户获取自己的文章
    posts = await prisma.post.findMany({
      where: { authorUid: payload.uid },
      ...baseQuery,
    });
  } else {
    // 匿名用户仅看已发布文章
    posts = await prisma.post.findMany({
      where: { published: true },
      ...baseQuery,
    });
  }

  return NextResponse.json(posts);
}


export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "无效身份" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "无效身份" }, { status: 401 });
  }

  const { title, content, published, slug: rawSlug } = await request.json();

  if (!title || !content) {
    return NextResponse.json({ error: "缺少标题或内容" }, { status: 400 });
  }

  const baseSlug = rawSlug?.trim() || generateSlug(title);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await prisma.post.findUnique({
      where: { slug },
    })
  ) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      published: published ?? false,
      slug,
      authorUid: payload.uid,
    },
  });

  return NextResponse.json(post);
}
