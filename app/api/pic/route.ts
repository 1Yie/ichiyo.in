import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
