import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function GET(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const token = tokenMatch[1];

  try {
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id ?? null,
        email: payload.email ?? null,
        uid: payload.uid ?? null,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
