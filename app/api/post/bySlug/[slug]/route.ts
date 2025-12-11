import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
	request: Request,
	props: { params: Promise<{ slug: string }> }
) {
	const params = await props.params;
	const { slug } = params;

	const post = await prisma.post.findUnique({
		where: { slug },
		select: {
			id: true,
			tags: {
				select: {
					id: true,
					name: true,
				},
			},
			slug: true,
			title: true,
			content: true,
			published: true,
			createdAt: true,
			updatedAt: true,
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
	});

	if (!post) {
		return NextResponse.json({ error: '文章不存在' }, { status: 404 });
	}

	if (!post.published) {
		// return NextResponse.json({ error: "文章未发布" }, { status: 403 });
		return NextResponse.json({ error: '文章不存在' }, { status: 404 });
	}

	// 提取 authors 中的 user
	const authors = post.authors.map((a) => a.user);

	return NextResponse.json({
		...post,
		authors,
	});
}
