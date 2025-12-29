'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { request } from '@/hooks/use-request';
import { useSearchParams } from 'next/navigation';

interface Post {
	id: number;
	slug: string;
	title: string;
	tags: { id: number; name: string }[];
	createdAt: string;
	updatedAt: string;
	authors: { user: { uid: number; id: string; email: string } }[];
}

const postsPerPage = 6;
const getPosts = request<Post[]>('/api/post/public?summary=true');

export default function PostsList({
	currentPage,
	setCurrentPage,
}: {
	currentPage: number;
	setCurrentPage: (page: number) => void;
}) {
	const posts = use(getPosts);
	const searchParams = useSearchParams();

	const totalPosts = posts.length;
	const totalPages = Math.ceil(totalPosts / postsPerPage);
	const startIndex = (currentPage - 1) * postsPerPage;
	const endIndex = startIndex + postsPerPage;
	const paginatedPosts = posts.slice(startIndex, endIndex);

	// SEO 优化
	useEffect(() => {
		const syncPageFromUrl = () => {
			const params = new URLSearchParams(window.location.search);
			const page = params.get('page');
			const pageNum = page ? parseInt(page) : 1;
			if (!isNaN(pageNum) && pageNum !== currentPage) {
				setCurrentPage(pageNum);
			}
		};

		syncPageFromUrl();
		window.addEventListener('popstate', syncPageFromUrl);

		return () => {
			window.removeEventListener('popstate', syncPageFromUrl);
		};
	}, [searchParams, setCurrentPage, currentPage]);

	return (
		<>
			<div className="border-b">
				<section className="section-base">
					{paginatedPosts.length === 0 ? (
						<p className="p-4 text-center text-gray-500 dark:text-gray-400">
							暂无文章
						</p>
					) : (
						<ul className="space-y-4">
							{paginatedPosts.map((post) => (
								<li key={post.id} className="m-0 border-b p-0 last:border-b-0">
									<div className="group relative flex flex-col transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-black">
										<Link
											href={`/blog/${post.slug}`}
											className="absolute inset-0 z-0"
											aria-label={post.title}
										/>

										<div
											className={`pointer-events-none relative z-10 p-4 ${post.tags.length > 0 ? 'pb-0' : 'pb-4'}`}
										>
											<p className="text-2xl font-semibold">
												{post.title || post.slug}
											</p>
											<div className="flex flex-row flex-wrap items-center justify-start gap-2">
												{post.authors.length > 0 ? (
													<p className="text-lg text-gray-500 dark:text-gray-400">
														{post.authors.map((author, index) => (
															<span
																key={`${post.id}-author-${author.user.uid}`}
															>
																{index > 0 && ', '}
																{author.user.id}
															</span>
														))}
													</p>
												) : (
													<p className="text-lg text-gray-500 dark:text-gray-400">
														匿名
													</p>
												)}
												<p className="text-lg text-gray-500 dark:text-gray-600">
													·
												</p>
												<p className="text-lg text-gray-500 dark:text-gray-400">
													{new Date(post.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>

										{post.tags.length > 0 && (
											<div className="pointer-events-none relative z-20 mt-2 w-fit px-4 pb-4">
												<div className="flex flex-wrap gap-2">
													{post.tags.map((tag) => (
														<Link
															key={`tag-${post.id}-${tag.id}`}
															href={`/tags/${encodeURIComponent(tag.name)}`}
															className="bg-accent text-accent-foreground hover:bg-accent/80 pointer-events-auto relative z-30 inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium transition"
														>
															<span className="text-accent-foreground/60 mr-1 select-none">
																#
															</span>
															{tag.name}
														</Link>
													))}
												</div>
											</div>
										)}
									</div>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>
			{totalPosts > postsPerPage && (
				<div className="border-b">
					<section className="section-base p-3">
						<Pagination>
							<PaginationContent>
								{/* 上一页 */}
								<PaginationItem className="relative">
									{/* 隐藏的 A 标签：仅供 Google 爬虫识别 URL，TopLoader 不会监听隐藏且无交互的 A */}
									{currentPage > 1 && (
										<a
											href={`?page=${currentPage - 1}`}
											className="hidden"
											aria-hidden="true"
										>
											Previous Page
										</a>
									)}
									<PaginationPrevious
										onClick={() => {
											if (currentPage > 1) {
												const nextP = currentPage - 1;
												window.history.pushState(null, '', `?page=${nextP}`);
												setCurrentPage(nextP);
											}
										}}
										className={
											currentPage === 1
												? 'pointer-events-none opacity-50'
												: 'cursor-pointer'
										}
									/>
								</PaginationItem>

								{/* 页码数字 */}
								{Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
									let pageNum;
									if (totalPages <= 5) pageNum = i + 1;
									else {
										if (currentPage <= 3) pageNum = i + 1;
										else if (currentPage >= totalPages - 2)
											pageNum = totalPages - 4 + i;
										else pageNum = currentPage - 2 + i;
									}
									return (
										<PaginationItem key={pageNum} className="relative">
											{/* 隐藏的 A 标签给 SEO */}
											<a
												href={`?page=${pageNum}`}
												className="hidden"
												aria-hidden="true"
											>
												Page {pageNum}
											</a>
											<PaginationLink
												isActive={currentPage === pageNum}
												onClick={() => {
													window.history.pushState(
														null,
														'',
														`?page=${pageNum}`
													);
													setCurrentPage(pageNum);
												}}
												className="cursor-pointer"
											>
												{pageNum}
											</PaginationLink>
										</PaginationItem>
									);
								})}

								{/* 省略号逻辑 */}
								{totalPages > 5 && currentPage < totalPages - 2 && (
									<>
										<PaginationItem>
											<PaginationEllipsis />
										</PaginationItem>
										<PaginationItem className="relative">
											<a
												href={`?page=${totalPages}`}
												className="hidden"
												aria-hidden="true"
											>
												Last Page
											</a>
											<PaginationLink
												onClick={() => {
													window.history.pushState(
														null,
														'',
														`?page=${totalPages}`
													);
													setCurrentPage(totalPages);
												}}
												className="cursor-pointer"
											>
												{totalPages}
											</PaginationLink>
										</PaginationItem>
									</>
								)}

								{/* 下一页 */}
								<PaginationItem className="relative">
									{currentPage < totalPages && (
										<a
											href={`?page=${currentPage + 1}`}
											className="hidden"
											aria-hidden="true"
										>
											Next Page
										</a>
									)}
									<PaginationNext
										onClick={() => {
											if (currentPage < totalPages) {
												const nextP = currentPage + 1;
												window.history.pushState(null, '', `?page=${nextP}`);
												setCurrentPage(nextP);
											}
										}}
										className={
											currentPage === totalPages
												? 'pointer-events-none opacity-50'
												: 'cursor-pointer'
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</section>
				</div>
			)}
		</>
	);
}
