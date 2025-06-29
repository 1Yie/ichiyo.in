import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const uid = parseInt(params.uid);

  if (isNaN(uid)) {
    return NextResponse.json({ error: "无效的 UID" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { uid },
    select: {
      uid: true,
      id: true,
      email: true, 
    },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  return NextResponse.json(user);
}
