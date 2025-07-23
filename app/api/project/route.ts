import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取所有项目
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        link: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(projects);
  } catch {
    return NextResponse.json({ error: "获取项目失败" }, { status: 500 });
  }
}

// 新建项目
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, link, icon } = body;

    // 基础校验
    if (!name || !description || !link || !icon) {
      return NextResponse.json({ error: "字段不能为空" }, { status: 400 });
    }

    const created = await prisma.project.create({
      data: {
        name,
        description,
        link,
        icon,
      },
    });

    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "创建项目失败" }, { status: 500 });
  }
}
