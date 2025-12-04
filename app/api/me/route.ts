import { NextResponse, NextRequest } from 'next/server';
import {
	authenticateToken,
	hashPassword,
	verifyToken,
	generateToken,
	getTokenExpirationInSeconds,
} from '@/lib/auth';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		return NextResponse.json({ authenticated: false }, { status: 401 });
	}

	try {
		const payload = await authenticateToken(token);

		if (!payload) {
			return NextResponse.json({ authenticated: false }, { status: 401 });
		}

		const userFromDb = await prisma.user.findUnique({
			where: { uid: payload.uid },
			select: {
				id: true,
				email: true,
				isAdmin: true,
				isSuperAdmin: true,
			},
		});

		if (!userFromDb) {
			return NextResponse.json({ authenticated: false }, { status: 401 });
		}

		return NextResponse.json({
			authenticated: true,
			user: {
				id: userFromDb.id,
				email: userFromDb.email,
				uid: payload.uid,
				isAdmin: userFromDb.isAdmin,
				isSuperAdmin: userFromDb.isSuperAdmin,
			},
		});
	} catch (error) {
		console.error('GET /api/me error:', error);
		return NextResponse.json({ authenticated: false }, { status: 401 });
	}
}

export async function PATCH(req: NextRequest) {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	const tokenResult = await verifyToken(token);
	if (!tokenResult.success || !tokenResult.payload) {
		return NextResponse.json({ error: '无效 token' }, { status: 401 });
	}

	const { uid } = tokenResult.payload;

	let body: { id?: string; password?: string };

	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: '无效的请求体' }, { status: 400 });
	}

	const { id: newId, password: newPassword } = body;

	if (!newId && !newPassword) {
		return NextResponse.json(
			{ error: '必须至少提供新的用户名或密码' },
			{ status: 400 }
		);
	}

	try {
		const dataToUpdate: { id?: string; hashpassword?: string } = {};

		if (newId) {
			// 检查新用户名是否被占用（排除当前用户自己）
			const existingUser = await prisma.user.findUnique({
				where: { id: newId },
			});
			if (existingUser && existingUser.uid !== uid) {
				return NextResponse.json({ error: '用户名已被占用' }, { status: 400 });
			}
			dataToUpdate.id = newId;
		}

		if (newPassword) {
			dataToUpdate.hashpassword = await hashPassword(newPassword);
		}

		const updatedUser = await prisma.user.update({
			where: { uid },
			data: dataToUpdate,
			select: {
				uid: true,
				id: true,
				email: true,
			},
		});

		// 如果更新了用户名，需要重新生成JWT token
		if (newId) {
			const newToken = await generateToken({
				uid: updatedUser.uid,
				email: updatedUser.email,
				id: updatedUser.id,
			});

			const response = NextResponse.json({ success: true, user: updatedUser });

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
		}

		return NextResponse.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error('PATCH /api/me error:', error);
		return NextResponse.json({ error: '服务器错误' }, { status: 500 });
	}
}
