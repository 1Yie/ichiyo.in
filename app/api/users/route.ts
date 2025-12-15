import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
	const session = await auth();

	if (!session) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
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
