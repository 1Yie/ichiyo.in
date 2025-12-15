import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const session = await auth();

		if (!session || !session.user?.id)
			return NextResponse.json({ message: '未登录' }, { status: 401 });

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		});

		if (!user?.isAdmin)
			return NextResponse.json({ message: '权限不足' }, { status: 403 });

		const now = Date.now();

		// 查询最新的密钥
		const latestKey = await prisma.registerKey.findFirst({
			orderBy: { createdAt: 'desc' },
		});

		if (!latestKey) {
			return NextResponse.json({
				exists: false,
				message: '没有找到任何密钥',
			});
		}

		const isExpired = latestKey.expiresAt < BigInt(now);
		const isUsed = latestKey.isUsed;

		return NextResponse.json({
			exists: true,
			id: latestKey.id,
			key: latestKey.key,
			expiresAt: latestKey.expiresAt.toString(), // BigInt 序列化处理
			isExpired,
			isUsed,
			isValid: !isExpired && !isUsed,
			createdAt: latestKey.createdAt.toISOString(),
		});
	} catch (err) {
		console.error('检查密钥状态失败:', err);
		return NextResponse.json({ message: '服务器错误' }, { status: 500 });
	}
}
