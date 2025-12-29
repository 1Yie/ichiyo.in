'use client';

import type { Post } from '@/types/post';
import { request } from '@/hooks/use-request';
import { use } from 'react';
import Link from 'next/link';

const getPosts = request<Post[]>('/api/post/public?summary=true');

type GroupedPosts = {
	year: string;
	months: {
		month: string;
		posts: Post[];
	}[];
}[];

function groupPostsStructured(posts: Post[]): GroupedPosts {
	const groups: Record<string, Record<string, Post[]>> = {};

	posts.forEach((post) => {
		const date = new Date(post.createdAt);
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString();

		if (!groups[year]) groups[year] = {};
		if (!groups[year][month]) groups[year][month] = [];
		groups[year][month].push(post);
	});

	return Object.keys(groups)
		.sort((a, b) => b.localeCompare(a))
		.map((year) => ({
			year,
			months: Object.keys(groups[year])
				.sort((a, b) => b.localeCompare(a))
				.map((month) => ({
					month,
					posts: groups[year][month],
				})),
		}));
}

function PostMain({ posts }: { posts: Post[] }) {
	const grouped = groupPostsStructured(posts);

	return (
		<div className="border-b">
			<section className="section-base">
				<div className="mx-auto max-w-5xl p-6 sm:p-12">
					{/* Header */}
					{/* <div className="mb-16">
						<p className="text-base mt-2 text-gray-500 dark:text-gray-400">
							共 {posts.length} 篇文章
						</p>
					</div> */}

					<div className="space-y-20">
						{grouped.map((group) => (
							<div
								key={group.year}
								className="relative flex flex-col gap-8 md:flex-row md:gap-16"
							>
								<div className="md:w-32 md:shrink-0">
									<h2 className="sticky top-24 text-6xl leading-none font-bold md:text-right">
										<span className="bg-gradient-to-b from-gray-700 to-gray-100 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-500">
											{group.year}
										</span>
										<span className="ml-1 text-xl font-medium text-gray-400 dark:text-gray-600">
											年
										</span>
									</h2>
								</div>

								<div className="relative flex-1 border-l border-gray-200 dark:border-gray-800">
									<div className="flex flex-col gap-12 pl-8 md:pl-12">
										{group.months.map((item) => (
											<div key={item.month} className="relative">
												<div className="absolute top-2 -left-[38px] h-3 w-3 rounded-full border-2 border-white bg-gray-300 md:-left-[54px] dark:border-black dark:bg-gray-600" />

												{/* 月份标题 */}
												<h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
													{item.month}{' '}
													<span className="text-sm font-normal text-gray-500">
														月
													</span>
												</h3>

												{/* 文章列表 */}
												<ul className="space-y-3">
													{item.posts.map((post) => {
														const day = new Date(post.createdAt)
															.getDate()
															.toString()
															.padStart(2, '0');
														return (
															<li key={post.id} className="group">
																<Link
																	href={`/blog/${post.slug}`}
																	className="flex items-baseline gap-6 rounded-lg py-2 transition-all duration-300 hover:translate-x-2"
																>
																	{/* 具体天数 */}
																	<span className="group-hover:text-primary font-mono text-sm font-medium text-gray-400">
																		{day}{' '}
																		<span className="text-[10px] opacity-60">
																			日
																		</span>
																	</span>

																	{/* 文章标题 */}
																	<span className="text-lg text-gray-700 transition-colors group-hover:font-medium group-hover:text-black dark:text-gray-300 dark:group-hover:text-white">
																		{post.title}
																	</span>
																</Link>
															</li>
														);
													})}
												</ul>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}

export default function ArchiveMain() {
	const posts = use(getPosts);
	return <PostMain posts={posts} />;
}
