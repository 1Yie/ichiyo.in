import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

async function isValidToken(token: string): Promise<boolean> {
  try {
    await verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  const isLoginPage = pathname === "/login";
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (token && !(await isValidToken(token))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);

    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("token");
    return res;
  }

  if (isDashboardPage && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && token && (await isValidToken(token))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
