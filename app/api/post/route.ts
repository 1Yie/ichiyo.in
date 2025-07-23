import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { generateSlug } from "@/lib/slug";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore).get("token")?.value;

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
    let currentUser = null;

    if (payload) {
      const user = await prisma.user.findUnique({
        where: { uid: payload.uid },
        select: { isAdmin: true, uid: true },
      });

      currentUser = user;

      if (user?.isAdmin) {
        if (summary) {
          posts = await prisma.post.findMany({
            orderBy: { id: "desc" },
            select: {
              id: true,
              slug: true,
              title: true,
              published: true,
              createdAt: true,
              updatedAt: true,
              tags: { select: { id: true, name: true } },
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
        } else {
          posts = await prisma.post.findMany({
            orderBy: { id: "desc" },
            include: {
              tags: true,
              authors: {
                include: {
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
        }
      } else {
        if (summary) {
          posts = await prisma.post.findMany({
            where: { authors: { some: { userId: payload.uid } } },
            orderBy: { id: "desc" },
            select: {
              id: true,
              slug: true,
              title: true,
              published: true,
              createdAt: true,
              updatedAt: true,
              tags: { select: { id: true, name: true } },
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
        } else {
          posts = await prisma.post.findMany({
            where: { authors: { some: { userId: payload.uid } } },
            orderBy: { id: "desc" },
            include: {
              tags: true,
              authors: {
                include: {
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
        }
      }
    } else {
      // 匿名用户
      if (summary) {
        posts = await prisma.post.findMany({
          where: { published: true },
          orderBy: { id: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            tags: { select: { id: true, name: true } },
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
      } else {
        posts = await prisma.post.findMany({
          where: { published: true },
          orderBy: { id: "desc" },
          include: {
            tags: true,
            authors: {
              include: {
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
      }
    }

    return NextResponse.json({ posts, currentUser });
  } catch (error) {
    console.error("GET /api/post error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
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

    const {
      title,
      content,
      published,
      slug: rawSlug,
      authors,
      tags,
    } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "缺少标题或内容" }, { status: 400 });
    }

    if (authors && authors.length > 0) {
      const authorIds = await prisma.user.findMany({
        where: {
          uid: {
            in: authors,
          },
        },
        select: {
          uid: true,
        },
      });

      if (authorIds.length !== authors.length) {
        return NextResponse.json({ error: "无效作者" }, { status: 400 });
      }
    }

    const baseSlug = rawSlug?.trim() || generateSlug(title);
    let slug = baseSlug;
    let suffix = 1;

    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const uniqueAuthors = Array.from(
      new Set([payload.uid, ...(authors ?? [])])
    );

    const tagData =
      Array.isArray(tags) && tags.length > 0
        ? {
            tags: {
              connectOrCreate: tags.map((name: string) => ({
                where: { name },
                create: { name },
              })),
            },
          }
        : {};

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published ?? false,
        slug,
        authors: {
          create: uniqueAuthors.map((uid: number) => ({
            user: { connect: { uid } },
          })),
        },
        ...tagData,
      },
      include: {
        tags: true,
        authors: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (err) {
    const error = err instanceof Error ? err : new Error("服务器错误");
    console.error("POST /api/post error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
