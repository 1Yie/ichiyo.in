import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取所有项目
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: "获取项目失败" }, { status: 500 });
  }
}

// 新建项目
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, link, icon } = body;

    if (!name || !description || !link || !icon) {
      return NextResponse.json({ error: "字段不能为空" }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: { name, description, link, icon },
    });

    return NextResponse.json(newProject);
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
