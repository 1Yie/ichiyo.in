import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  if (!tokenMatch) {
    return NextResponse.json({ success: false, message: "no token provided" }, { status: 401 });
  }
  const token = tokenMatch[1];

  try {
    verifyToken(token);
    const response = NextResponse.json({ success: true });
    response.cookies.set("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "token not a valid token" }, { status: 401 });
  }
}
