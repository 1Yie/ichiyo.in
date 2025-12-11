import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	let payload;
	try {
		payload = verifyToken(token);
		if (!payload) {
			return NextResponse.json({ error: '无效身份' }, { status: 401 });
		}
	} catch {
		return NextResponse.json({ error: '无效身份' }, { status: 401 });
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
