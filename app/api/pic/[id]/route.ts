import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "无效的图片ID" }, { status: 400 });

  // token 校验
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "无效身份" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "无效身份" }, { status: 401 });
  }

  const pic = await prisma.pic.findUnique({ where: { id } });
  if (!pic) return NextResponse.json({ error: "图片未找到" }, { status: 404 });

  return NextResponse.json(pic);
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "无效的图片ID" }, { status: 400 });

  // token 校验
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "无效身份" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "无效身份" }, { status: 401 });
  }

  const body = await request.json();
  const dataToUpdate: Partial<{
    title: string;
    src: string;
    button: unknown;
    link: unknown;
    newTab: boolean;
  }> = {};
  if (typeof body.title === "string") dataToUpdate.title = body.title;
  if (typeof body.src === "string") dataToUpdate.src = body.src;
  if (body.button !== undefined) dataToUpdate.button = body.button;
  if (body.link !== undefined) dataToUpdate.link = body.link;
  if (typeof body.newTab === "boolean") dataToUpdate.newTab = body.newTab;

  try {
    const updatedPic = await prisma.pic.update({
      where: { id },
      data: {
        title: dataToUpdate.title,
        src: dataToUpdate.src,
        button:
          typeof dataToUpdate.button === "string"
            ? dataToUpdate.button
            : undefined,
        link:
          typeof dataToUpdate.link === "string" ? dataToUpdate.link : undefined,
        newTab: dataToUpdate.newTab,
      },
    });
    return NextResponse.json(updatedPic);
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "无效的图片ID" }, { status: 400 });

  // token 校验
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "未登录" }, { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "无效身份" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "无效身份" }, { status: 401 });
  }

  try {
    await prisma.pic.delete({ where: { id } });
    return NextResponse.json({ message: "删除成功" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
