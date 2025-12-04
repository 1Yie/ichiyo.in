import { NextResponse, NextRequest } from 'next/server';
import {
	authenticateToken,
	verifyPassword,
	generateToken,
	getTokenExpirationInSeconds,
} from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	try {
		const payload = await authenticateToken(token);
		if (!payload) {
			return NextResponse.json({ error: '无效身份' }, { status: 401 });
		}

		const { uid } = payload;
		let body: { newEmail?: string; currentPassword?: string };

		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: '无效的请求体' }, { status: 400 });
		}

		const { newEmail, currentPassword } = body;

		// 验证必要参数
		if (!newEmail || !currentPassword) {
			return NextResponse.json(
				{ error: '请提供新邮箱和当前密码' },
				{ status: 400 }
			);
		}

		// 验证邮箱格式
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newEmail)) {
			return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
		}

		// 获取当前用户信息
		const currentUser = await prisma.user.findUnique({
			where: { uid },
			select: {
				uid: true,
				email: true,
				hashpassword: true,
			},
		});

		if (!currentUser) {
			return NextResponse.json({ error: '用户不存在' }, { status: 404 });
		}

		// 验证当前密码
		const passwordResult = await verifyPassword(
			currentPassword,
			currentUser.hashpassword
		);
		if (!passwordResult.isValid) {
			return NextResponse.json({ error: '当前密码错误' }, { status: 400 });
		}

		// 检查新邮箱是否与当前邮箱相同
		if (newEmail === currentUser.email) {
			return NextResponse.json(
				{ error: '新邮箱不能与当前邮箱相同' },
				{ status: 400 }
			);
		}

		// 检查新邮箱是否已被其他用户使用
		const existingUser = await prisma.user.findUnique({
			where: { email: newEmail },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: '该邮箱已被其他用户使用' },
				{ status: 400 }
			);
		}

		// 更新用户邮箱
		const updatedUser = await prisma.user.update({
			where: { uid },
			data: { email: newEmail },
			select: {
				uid: true,
				id: true,
				email: true,
				isAdmin: true,
				isSuperAdmin: true,
			},
		});

		// 重新生成JWT token，因为邮箱信息已更新
		const newToken = await generateToken({
			uid: updatedUser.uid,
			email: updatedUser.email,
			id: updatedUser.id,
		});

		const response = NextResponse.json({
			success: true,
			message: '邮箱更换成功',
			user: updatedUser,
		});

		// 更新cookie中的token
		const expiresInSeconds = getTokenExpirationInSeconds();
		response.cookies.set('token', newToken, {
			httpOnly: true,
			path: '/',
			maxAge: expiresInSeconds,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		});

		return response;
	} catch (error) {
		console.error('PATCH /api/me/email error:', error);
		return NextResponse.json({ error: '服务器错误' }, { status: 500 });
	}
}
