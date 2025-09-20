import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
}

function sanitizeUser(user: {
  uid: number;
  id: string;
  email: string;
  isAdmin: boolean;
  hashpassword?: string;
}) {
  const { uid, id, email, isAdmin } = user;
  return { uid, id, email, isAdmin };
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

  const payload = await authenticateToken(token);
  if (!payload) {
    return NextResponse.json({ error: "无效身份" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      authors: { include: { user: true } },
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

  // 扁平化 authors
  const authors = post.authors.map((a) => sanitizeUser(a.user));

  return NextResponse.json({ ...post, authors });
}

export async function PATCH(request: Request, props: Params) {
  const params = await props.params;
  const postId = Number(params.id);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "无效文章ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const payload = await authenticateToken(token);
  if (!payload) {
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

  const slug = rawSlug?.trim() || generateSlug(title);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Slug 格式不合法，只允许小写字母、数字和连字符" },
      { status: 400 }
    );
  }

  const hasContentChanged =
    title.trim() !== post.title ||
    content.trim() !== post.content ||
    slug !== post.slug;

  if (hasContentChanged) {
    if (!title?.trim())
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    if (!content?.trim())
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  const validUsers = await prisma.user.findMany({
    where: { uid: { in: authors } },
    select: { uid: true },
  });

  if (validUsers.length !== authors.length) {
    return NextResponse.json({ error: "存在无效作者" }, { status: 400 });
  }

  if (!authors.includes(payload.uid)) authors.push(payload.uid);

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
        create: authors.map((uid: number) => ({ user: { connect: { uid } } })),
      },
      tags: { set: tagRecords.map((t) => ({ id: t.id })) },
    },
    include: { authors: { include: { user: true } }, tags: true },
  });

  // 扁平化 authors
  const flatAuthors = updatedPost.authors.map((a) => sanitizeUser(a.user));

  return NextResponse.json({ ...updatedPost, authors: flatAuthors });
}

export async function DELETE(request: Request, props: Params) {
  const params = await props.params;
  const postId = Number(params.id);
  if (isNaN(postId))
    return NextResponse.json({ error: "无效文章ID" }, { status: 400 });

  const cookieStore = await cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const payload = await authenticateToken(token);
  if (!payload)
    return NextResponse.json({ error: "无效身份" }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { authors: true },
  });

  if (!post) return NextResponse.json({ error: "文章不存在" }, { status: 404 });

  const user = await prisma.user.findUnique({
    where: { uid: payload.uid },
    select: { isAdmin: true },
  });

  const isOwnerOrAdmin =
    post.authors.some((a) => a.userId === payload.uid) || user?.isAdmin;
  if (!isOwnerOrAdmin)
    return NextResponse.json({ error: "无权限操作此文章" }, { status: 403 });

  await prisma.post.delete({ where: { id: postId } });

  return NextResponse.json({ success: true });
}
