'use client';

import type { Post } from '@/types/post';
import { request } from '@/hooks/use-request';
import { use } from 'react';
import Link from 'next/link';

const getPosts = request<Post[]>('/api/post/public?summary=true');

function groupPostsByDate(posts: Post[]): Record<string, Post[]> {
	const groupedPosts: Record<string, Post[]> = {};
	posts.forEach((post) => {
		const date = new Date(post.createdAt);

		const yearMonth =
			date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
		if (!groupedPosts[yearMonth]) {
			groupedPosts[yearMonth] = [];
		}
		groupedPosts[yearMonth].push(post);
	});
	return groupedPosts;
}

function PostMain({ posts }: { posts: Post[] }) {
	return (
		<>
			<div className="border-b">
				<section className="section-base">
					<div className="p-8 sm:p-16">
						{Object.entries(groupPostsByDate(posts)).map(([date, posts]) => (
							<div key={date} className="relative mb-12 flex items-start gap-8">
								{/* 左侧日期 */}
								<h2 className="sticky top-0 min-w-[80px] text-2xl font-bold sm:min-w-[120px]">
									{date}
								</h2>

								{/* 右侧文章列表 */}
								<ul className="flex-1 space-y-2">
									{posts.map((post) => (
										<li key={post.id}>
											<Link
												className="hover:underline"
												href={`/blog/${post.slug}`}
											>
												<h3 className="text-xl">{post.title}</h3>
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</section>
			</div>
		</>
	);
}

export default function ArchiveMain() {
	const posts = use(getPosts);
	return (
		<>
			<PostMain posts={posts} />
		</>
	);
}
