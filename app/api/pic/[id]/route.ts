import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // 你项目中 Prisma 客户端的导入路径

export async function GET(
  request: NextRequest,
  { params }: { params: { id: number } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "无效的图片ID" }, { status: 400 });

  const pic = await prisma.pic.findUnique({ where: { id } });
  if (!pic) return NextResponse.json({ error: "图片未找到" }, { status: 404 });

  return NextResponse.json(pic);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: number } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "无效的图片ID" }, { status: 400 });

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "无效的图片ID" }, { status: 400 });

  try {
    await prisma.pic.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
