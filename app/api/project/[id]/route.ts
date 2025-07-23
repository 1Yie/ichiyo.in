import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: { id: string };
}

// 获取单个项目
export async function GET(req: Request, { params }: Params) {
  const { id } = params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });

    if (!project) {
      return NextResponse.json({ error: "未找到该项目" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 修改项目
export async function PATCH(req: Request, { params }: Params) {
  const { id } = params;
  try {
    const body = await req.json();
    const updated = await prisma.project.update({
      where: { id: Number(id) },
      data: body,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "修改失败" }, { status: 500 });
  }
}

// 删除项目
export async function DELETE(req: Request, { params }: Params) {
  const { id } = params;
  try {
    await prisma.project.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
