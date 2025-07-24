import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, props: Params) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "无效的好友ID" }, { status: 400 });
  }

  try {
    const friend = await prisma.friend.findUnique({
      where: { id },
      include: { socialLinks: true },
    });

    if (!friend) {
      return NextResponse.json({ error: "好友不存在" }, { status: 404 });
    }

    return NextResponse.json(friend);
  } catch (error) {
    console.error("获取好友失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: Params) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "无效的好友ID" }, { status: 400 });
  }

  // 校验 token
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

  try {
    const body = await request.json();
    const { name, image, description, pinned, socialLinks } = body;

    if (
      typeof name !== "string" ||
      typeof image !== "string" ||
      typeof description !== "string" ||
      typeof pinned !== "boolean" ||
      !Array.isArray(socialLinks)
    ) {
      return NextResponse.json({ error: "参数格式错误" }, { status: 400 });
    }

    // 更新 Friend 基本信息
    await prisma.friend.update({
      where: { id },
      data: {
        name,
        image,
        description,
        pinned,
      },
    });

    // 删除旧的 Social 记录
    await prisma.social.deleteMany({
      where: { friendId: id },
    });

    // 创建新的 Social 记录，确保使用正确的字段名
    if (socialLinks.length > 0) {
      await prisma.social.createMany({
        data: socialLinks.map((link: { name: string; link: string; iconLight: string; iconDark: string }) => ({
          name: link.name,
          link: link.link,
          iconLight: link.iconLight,
          iconDark: link.iconDark,
          friendId: id,
        })),
      });
    }

    // 返回更新后的数据
    const updatedFriend = await prisma.friend.findUnique({
      where: { id },
      include: { socialLinks: true },
    });

    return NextResponse.json(updatedFriend);
  } catch (error) {
    console.error("更新好友失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}


export async function DELETE(request: Request, props: Params) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "无效的好友ID" }, { status: 400 });
  }

  // 校验 token
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

  try {
    await prisma.friend.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除好友失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
