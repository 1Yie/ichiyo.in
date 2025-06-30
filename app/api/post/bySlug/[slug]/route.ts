import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
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
  });

  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  if (!post.published) {
    // 如果你需要做权限校验，可以在这里判断访问者身份
    // 暂时默认不允许未发布文章被匿名访问
    return NextResponse.json({ error: "文章未发布" }, { status: 403 });
  }

  return NextResponse.json(post);
}
