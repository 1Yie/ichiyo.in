import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ name: string }> }
) {
	const tagName = decodeURIComponent((await params).name || '');

	if (!tagName.trim()) {
		return NextResponse.json({ error: '标签名不能为空' }, { status: 400 });
	}

	try {
		const tag = await prisma.tag.findUnique({
			where: { name: tagName },
			include: {
				posts: {
					where: {
						published: true,
					},
					select: {
						id: true,
						slug: true,
						title: true,
						tags: {
							select: {
								id: true,
								name: true,
							},
						},
						createdAt: true,
						authors: {
							select: {
								user: {
									select: {
										uid: true,
										id: true,
										email: true,
									},
								},
							},
						},
					},
					orderBy: {
						updatedAt: 'desc',
					},
				},
			},
		});

		if (!tag) {
			return NextResponse.json({ error: '标签不存在' }, { status: 404 });
		}

		return NextResponse.json({
			tag: { id: tag.id, name: tag.name },
			posts: tag.posts,
		});
	} catch (err) {
		console.error('获取标签文章失败', err);
		return NextResponse.json({ error: '获取失败' }, { status: 500 });
	}
}
