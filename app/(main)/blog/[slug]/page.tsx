import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { use } from 'react';
import BlogSlug from '@/ui/blog-slug';
import { request, baseUrl } from '@/hooks/use-request';
import type { Post, PostBySlug } from '@/types/post';
import { parseMarkdown } from '@/lib/markdown';

async function fetchPost(slug: string): Promise<Post | null> {
	try {
		const post = await request<Post>(`/api/post/bySlug/${slug}`, {
			cache: 'no-cache',
		});
		return post ?? null;
	} catch (error) {
		console.error('获取文章数据失败:', error);
		return null;
	}
}

function transformPost(post: Post | PostBySlug): PostBySlug {
	return {
		...post,
		authors: post.authors || [],
	};
}

export async function generateMetadata(props: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await props.params;
	const post = await fetchPost(slug);
	if (!post || !post.published) return { title: 'ichiyo | 404' };

	const description =
		post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '');
	return {
		title: `${post.title} | ichiyo`,
		description,
		keywords: post.tags.map((tag) => tag.name),
		openGraph: {
			title: post.title,
			description,
			type: 'article',
			url: `${baseUrl}/blog/${post.slug}`,
		},
	};
}

export default function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = use(params);
	const post = use(fetchPost(slug));
	if (!post || !post.published) notFound();

	const transformedPost = transformPost(post);
	const htmlContent = use(parseMarkdown(transformedPost.content));

	return <BlogSlug post={transformedPost} htmlContent={htmlContent} />;
}
