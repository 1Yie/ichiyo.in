import { NextResponse } from "next/server";
import { authenticateToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const token = tokenMatch[1];

  try {

    const payload = await authenticateToken(token);

    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { uid: payload.uid },
      select: { isAdmin: true },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id ?? null,
        email: payload.email ?? null,
        uid: payload.uid ?? null,
        isAdmin: user?.isAdmin ?? false,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
