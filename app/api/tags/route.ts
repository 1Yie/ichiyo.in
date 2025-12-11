import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const tags = await prisma.tag.findMany({
			orderBy: { name: 'asc' },
			select: {
				id: true,
				name: true,
			},
		});

		// 针对每个标签，统计已发布的文章数
		const tagsWithCount = await Promise.all(
			tags.map(async (tag) => {
				const count = await prisma.post.count({
					where: {
						published: true,
						tags: {
							some: { id: tag.id },
						},
					},
				});
				return {
					id: tag.id,
					name: tag.name,
					postCount: count,
				};
			})
		);

		return NextResponse.json({ tags: tagsWithCount });
	} catch (err) {
		console.error('获取标签失败', err);
		return NextResponse.json({ error: '获取标签失败' }, { status: 500 });
	}
}
