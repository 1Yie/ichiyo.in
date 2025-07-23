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

  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
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

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      authors: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { uid: payload.uid },
    select: { isAdmin: true },
  });

  const isOwnerOrAdmin =
    post.authors.some((a) => a.userId === payload.uid) || user?.isAdmin;

  if (!isOwnerOrAdmin) {
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

  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
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

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { authors: true, tags: true },
  });

  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { uid: payload.uid },
    select: { isAdmin: true },
  });

  const isOwnerOrAdmin =
    post.authors.some((a) => a.userId === payload.uid) || user?.isAdmin;

  if (!isOwnerOrAdmin) {
    return NextResponse.json({ error: "无权限操作此文章" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, published, slug: rawSlug, authors, tags } = body;

  if (!Array.isArray(authors)) {
    return NextResponse.json({ error: "作者列表格式错误" }, { status: 400 });
  }

  if (tags && !Array.isArray(tags)) {
    return NextResponse.json({ error: "标签格式错误" }, { status: 400 });
  }

  // 校验 slug 格式
  const slug = rawSlug?.trim() || generateSlug(title);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug 格式不合法，只允许小写字母、数字和连字符" },
      { status: 400 }
    );
  }

  // 校验标题和内容变更
  const hasContentChanged =
    title.trim() !== post.title ||
    content.trim() !== post.content ||
    slug !== post.slug;

  if (hasContentChanged) {
    if (!title?.trim()) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }
    if (!content?.trim()) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }
  }

  // 校验作者 ID 是否都有效（存在数据库）
  const validUsers = await prisma.user.findMany({
    where: {
      uid: { in: authors },
    },
    select: { uid: true },
  });

  if (validUsers.length !== authors.length) {
    return NextResponse.json({ error: "存在无效作者" }, { status: 400 });
  }

  // 保证自己一定是作者（避免自己被删除）
  if (!authors.includes(payload.uid)) {
    authors.push(payload.uid);
  }

  // 处理标签：去重、过滤空，查询已有，创建新增
  let tagRecords: { id: number; name: string }[] = [];
  if (tags && tags.length > 0) {
    const tagNames = Array.from(
      new Set(tags.map((t: string) => t.trim()).filter(Boolean))
    );

    const existingTags = await prisma.tag.findMany({
      where: { name: { in: tagNames as string[] } },
    });

    const existingTagNames = existingTags.map((t) => t.name);
    const newTagNames = tagNames.filter(
      (name): name is string =>
        typeof name === "string" && !existingTagNames.includes(name)
    );

    const newTags = await Promise.all(
      newTagNames.map((name) => prisma.tag.create({ data: { name } }))
    );

    tagRecords = [...existingTags, ...newTags];
  }

  // 更新文章及关联
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      published,
      title: hasContentChanged ? title.trim() : undefined,
      content: hasContentChanged ? content.trim() : undefined,
      slug: hasContentChanged ? slug : undefined,
      updatedAt: hasContentChanged ? new Date() : undefined,
      authors: {
        deleteMany: {},
        create: authors.map((uid: number) => ({
          user: { connect: { uid } },
        })),
      },
      tags: {
        set: tagRecords.map((t) => ({ id: t.id })),
      },
    },
    include: {
      authors: {
        include: {
          user: true,
        },
      },
      tags: true,
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

  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
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

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { authors: true },
  });

  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { uid: payload.uid },
    select: { isAdmin: true },
  });

  const isOwnerOrAdmin =
    post.authors.some((a) => a.userId === payload.uid) || user?.isAdmin;

  if (!isOwnerOrAdmin) {
    return NextResponse.json({ error: "无权限操作此文章" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: postId } });

  return NextResponse.json({ success: true });
}
