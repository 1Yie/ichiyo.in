import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const summary = searchParams.get("summary") === "true";

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { id: "desc" },
    ...(summary
      ? {
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
        }
      : {}),
  });

  return NextResponse.json(posts);
}
