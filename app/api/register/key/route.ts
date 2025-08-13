import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ms from "ms";

const KEY_TTL_MS = ms(process.env.KEY_TTL_MS as ms.StringValue);

function generateKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(randomBytes).toString("base64");
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "未登录" }, { status: 401 });

    const payload = await authenticateToken(token);
    if (!payload?.uid)
      return NextResponse.json({ message: "无效的 token" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { uid: payload.uid },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin)
      return NextResponse.json({ message: "权限不足" }, { status: 403 });

    const now = Date.now();

    // 查询最新未过期密钥
    const existing = await prisma.registerKey.findFirst({
      where: { expiresAt: { gt: BigInt(now) } },
      orderBy: { expiresAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        key: existing.key,
        expiresAt: existing.expiresAt.toString(),
      });
    }

    // 过期或不存在，生成新密钥
    const key = generateKey();
    const expiresAt = BigInt(now + KEY_TTL_MS);

    // 清理所有旧密钥
    await prisma.registerKey.deleteMany({});

    const newRecord = await prisma.registerKey.create({
      data: { key, expiresAt },
    });

    return NextResponse.json({
      id: newRecord.id,
      key: newRecord.key,
      expiresAt: newRecord.expiresAt.toString(),
    });
  } catch (err) {
    console.error("生成注册密钥失败:", err);
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
  }
}
