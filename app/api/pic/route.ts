import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const pics = await prisma.pic.findMany({
      select: {
        id: true,
        title: true,
        src: true,
        button: true,
        link: true,
        newTab: true,
      },
    });
    return NextResponse.json(pics);
  } catch {
    return NextResponse.json({ error: "获取图片数据失败" }, { status: 500 });
  }
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

  // 解析请求体
  const body = await request.json();
  const { title, src, button, link, newTab } = body;

  // 简单校验
  if (!title || !src) {
    return NextResponse.json({ error: "缺少必要字段 title 或 src" }, { status: 400 });
  }

  try {
    const pic = await prisma.pic.create({
      data: {
        title,
        src,
        button: button ?? null,
        link: link ?? null,
        newTab: newTab ?? false,

      },
    });

    return NextResponse.json(pic, { status: 201 });
  } catch (error) {
    console.error("创建图片失败:", error);
    return NextResponse.json({ error: "创建图片失败" }, { status: 500 });
  }
}
