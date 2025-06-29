import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const REQUIRED_KEY = process.env.REGISTER_KEY || "default_key";

export async function POST(request: Request) {
  try {
    const { id, email, password, registerKey } = await request.json();

    // 检查字段
    if (!id || !email || !password || !registerKey) {
      return NextResponse.json(
        { code: "MISSING_FIELDS", message: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 校验密钥
    if (registerKey !== REQUIRED_KEY) {
      return NextResponse.json(
        { code: "INVALID_REGISTER_KEY", message: "注册密钥错误" },
        { status: 403 }
      );
    }

    // 检查 id 或 email 是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { email }],
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { code: "USER_EXISTS", message: "ID 或邮箱已被注册" },
        { status: 409 }
      );
    }

    // 哈希密码
    const hashed = await hashPassword(password);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        id,
        email,
        hashpassword: hashed,
      },
    });

    return NextResponse.json(
      {
        code: "SUCCESS",
        message: "注册成功",
        uid: user.uid,
        id: user.id,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "服务器错误，请稍后再试" },
      { status: 500 }
    );
  }
}
