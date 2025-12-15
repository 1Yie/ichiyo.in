import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	const session = await auth();

	if (!session || !session.user?.email) {
		return NextResponse.json({ authenticated: false }, { status: 401 });
	}

	try {
		const userFromDb = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: {
				id: true,
				email: true,
				uid: true,
				isAdmin: true,
				isSuperAdmin: true,
			},
		});

		if (!userFromDb) {
			return NextResponse.json({ authenticated: false }, { status: 401 });
		}

		return NextResponse.json({
			authenticated: true,
			user: userFromDb,
		});
	} catch (error) {
		console.error('GET /api/me error:', error);
		return NextResponse.json({ authenticated: false }, { status: 401 });
	}
}

export async function PATCH(req: NextRequest) {
	const session = await auth();

	if (!session || !session.user?.email) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	let body: { id?: string };

	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: '无效的请求体' }, { status: 400 });
	}

	const { id: newId } = body;

	if (!newId) {
		return NextResponse.json({ error: '必须提供新的用户名' }, { status: 400 });
	}

	try {
		const existingUser = await prisma.user.findUnique({
			where: { id: newId },
		});

		if (existingUser && existingUser.email !== session.user.email) {
			return NextResponse.json({ error: '用户名已被占用' }, { status: 400 });
		}

		const updatedUser = await prisma.user.update({
			where: { email: session.user.email },
			data: {
				id: newId,
			},
			select: {
				uid: true,
				id: true,
				email: true,
			},
		});

		return NextResponse.json({ success: true, user: updatedUser });
	} catch (error) {
		console.error('PATCH /api/me error:', error);
		return NextResponse.json({ error: '服务器错误' }, { status: 500 });
	}
}
