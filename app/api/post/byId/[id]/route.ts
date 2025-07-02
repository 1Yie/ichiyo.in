import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, props: Params) {
  const params = await props.params;
  const postId = Number(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "无效文章ID" }, { status: 400 });
  }

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

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  if (post.authorUid !== payload.uid) {
    return NextResponse.json({ error: "无权限访问此文章" }, { status: 403 });
  }

  return NextResponse.json(post);
}

export async function PATCH(request: Request, props: Params) {
  const params = await props.params;
  const postId = Number(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "无效文章ID" }, { status: 400 });
  }

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

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  if (post.authorUid !== payload.uid) {
    return NextResponse.json({ error: "无权限操作此文章" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, published, slug: rawSlug } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  const slug = rawSlug?.trim() || generateSlug(title);

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug 格式不合法，只允许小写字母、数字和连字符" },
      { status: 400 }
    );
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title: title.trim(),
      content: content.trim(),
      published,
      slug,
    },
  });

  return NextResponse.json(updatedPost);
}

export async function DELETE(request: Request, props: Params) {
  const params = await props.params;
  const postId = Number(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "无效文章ID" }, { status: 400 });
  }

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

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  if (post.authorUid !== payload.uid) {
    return NextResponse.json({ error: "无权限操作此文章" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: postId } });

  return NextResponse.json({ success: true });
}
