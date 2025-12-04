import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET() {
	const cookieStore = await cookies();
	const cookieStoreInstance = await cookieStore;
	const token = cookieStoreInstance.get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	try {
		verifyToken(token);
	} catch {
		return NextResponse.json({ error: '无效 token' }, { status: 401 });
	}

	try {
		const users = await prisma.user.findMany({
			select: {
				uid: true,
				id: true,
				email: true,
				isAdmin: true,
				isSuperAdmin: true,
			},
			orderBy: {
				uid: 'desc',
			},
		});

		return NextResponse.json({ users });
	} catch (error) {
		console.error('获取用户失败:', error);
		return NextResponse.json({ error: '服务器错误' }, { status: 500 });
	}
}
