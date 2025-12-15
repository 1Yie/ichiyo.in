import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
	try {
		const friends = await prisma.friend.findMany({
			include: { socialLinks: true },
			orderBy: { pinned: 'desc' },
		});
		return NextResponse.json(friends);
	} catch (error) {
		console.error('获取好友列表失败:', error);
		return NextResponse.json({ error: '获取好友列表失败' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const session = await auth();

	if (!session) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { name, image, description, pinned = false, socialLinks } = body;

		if (!name || !image || !description || !Array.isArray(socialLinks)) {
			return NextResponse.json(
				{ error: '参数缺失或格式错误' },
				{ status: 400 }
			);
		}

		const friend = await prisma.friend.create({
			data: {
				name,
				image,
				description,
				pinned,
				socialLinks: {
					create: socialLinks,
				},
			},
			include: {
				socialLinks: true,
			},
		});

		return NextResponse.json(friend, { status: 201 });
	} catch (error) {
		console.error('创建 Friend 失败:', error);
		return NextResponse.json({ error: '服务器错误' }, { status: 500 });
	}
}
