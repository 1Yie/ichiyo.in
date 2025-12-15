import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const pics = await prisma.pic.findMany({
			select: {
				id: true,
				title: true,
				src: true,
				button: true,
				link: true,
				newTab: true,
			},
		});
		return NextResponse.json(pics);
	} catch {
		return NextResponse.json({ error: '获取图片数据失败' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const session = await auth();

	if (!session) {
		return NextResponse.json({ error: '未登录' }, { status: 401 });
	}

	const body = await request.json();
	const { title, src, button, link, newTab } = body;

	if (!title || !src) {
		return NextResponse.json(
			{ error: '缺少必要字段 title 或 src' },
			{ status: 400 }
		);
	}

	try {
		const pic = await prisma.pic.create({
			data: {
				title,
				src,
				button: button ?? null,
				link: link ?? null,
				newTab: newTab ?? false,
			},
		});

		return NextResponse.json(pic, { status: 201 });
	} catch (error) {
		console.error('创建图片失败:', error);
		return NextResponse.json({ error: '创建图片失败' }, { status: 500 });
	}
}
