import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const payload = await authenticateToken(token);
    if (!payload) {
      return NextResponse.json({ error: "无效身份" }, { status: 401 });
    }

    // 检查当前用户是否为超级管理员
    const currentUser = await prisma.user.findUnique({
      where: { uid: payload.uid },
      select: { isAdmin: true, isSuperAdmin: true },
    });

    if (!currentUser?.isSuperAdmin) {
      return NextResponse.json({ error: "只有超级管理员才能修改管理员权限" }, { status: 403 });
    }

    const { email, isAdmin } = await request.json();

    if (!email || typeof isAdmin !== "boolean") {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 查找目标用户
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { uid: true, email: true, isAdmin: true, isSuperAdmin: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 防止用户修改自己的管理员权限
    if (targetUser.uid === payload.uid) {
      return NextResponse.json({ error: "不能修改自己的管理员权限" }, { status: 400 });
    }

    // 防止修改超级管理员的权限
    if (targetUser.isSuperAdmin) {
      return NextResponse.json({ error: "不能修改超级管理员的权限" }, { status: 400 });
    }

    // 更新用户管理员权限
    const updatedUser = await prisma.user.update({
      where: { uid: targetUser.uid },
      data: { isAdmin },
      select: {
        uid: true,
        id: true,
        email: true,
        isAdmin: true,
        isSuperAdmin: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `已将 ${email} 设为${isAdmin ? "管理员" : "普通用户"}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("设置管理员权限失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}