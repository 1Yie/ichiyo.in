'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'nextjs-toploader/app';
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
import BlogPanel from '@/ui/blog-panel';

interface Post {
	id: number;
	slug: string;
	title: string;
	createdAt: string;
	authors: {
		user: {
			uid: number;
			id: string;
			email: string;
		};
	}[];
	tags: {
		id: number;
		name: string;
	}[];
}

interface TagData {
	tag: { id: number; name: string };
	posts: Post[];
}

const postsPerPage = 6;

export default function TagParams({ data }: { data: TagData }) {
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState(1);

	const sortedPosts = useMemo(() => {
		return [...data.posts].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
	}, [data.posts]);

	const totalPosts = sortedPosts.length;
	const totalPages = Math.ceil(totalPosts / postsPerPage);

	const currentPosts = useMemo(() => {
		const start = (currentPage - 1) * postsPerPage;
		const end = start + postsPerPage;
		return sortedPosts.slice(start, end);
	}, [sortedPosts, currentPage]);

	return (
		<>
			<BlogPanel />
			<div className="border-b">
				<section className="section-base">
					{currentPosts.length === 0 ? (
						<p className="p-4 text-center text-gray-500 dark:text-gray-400">
							暂无相关文章
						</p>
					) : (
						<ul className="space-y-4">
							{currentPosts.map((post) => (
								<li key={post.id} className="m-0 border-b p-0 last:border-b-0">
									<div
										className="cursor-pointer p-4 transition-colors duration-300 hover:bg-gray-50 dark:hover:bg-black"
										onClick={() => router.push(`/blog/${post.slug}`)}
									>
										<p className="text-2xl font-semibold">
											{post.title || post.slug}
										</p>
										<div className="flex flex-row flex-wrap items-center justify-start gap-2">
											{post.authors.length > 0 && (
												<p className="text-lg text-gray-500 dark:text-gray-400">
													{post.authors.map((author, index) => (
														<span key={`${post.id}-author-${author.user.uid}`}>
															{index > 0 && ', '}
															{author.user.id}
														</span>
													))}
												</p>
											)}
											<p className="text-lg text-gray-500 dark:text-gray-600">
												·
											</p>
											<p className="text-lg text-gray-500 dark:text-gray-400">
												{new Date(post.createdAt).toLocaleDateString()}
											</p>
										</div>
										{post.tags.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-2">
												{post.tags.map((tag) => (
													<Link
														key={`tag-${post.id}-${tag.id}`}
														href={`/tags/${encodeURIComponent(tag.name)}`}
														onClick={(e) => e.stopPropagation()}
														className="bg-accent text-accent-foreground hover:bg-accent/80 inline-flex cursor-pointer items-center rounded-full px-2 py-0.5 text-sm font-medium transition"
													>
														<span className="text-accent-foreground/60 mr-1 select-none">
															#
														</span>
														{tag.name}
													</Link>
												))}
											</div>
										)}
									</div>
								</li>
							))}
						</ul>
					)}
				</section>

				{/* 分页器 */}
				{totalPages > 1 && (
					<div className="border-t">
						<section className="section-base p-3">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() =>
												setCurrentPage((prev) => Math.max(prev - 1, 1))
											}
											className={
												currentPage === 1
													? 'pointer-events-none opacity-50'
													: 'cursor-pointer'
											}
										/>
									</PaginationItem>

									{Array.from({ length: Math.min(5, totalPages) }).map(
										(_, i) => {
											let pageNum: number;

											if (totalPages <= 5) {
												pageNum = i + 1;
											} else if (currentPage <= 3) {
												pageNum = i + 1;
											} else if (currentPage >= totalPages - 2) {
												pageNum = totalPages - 4 + i;
											} else {
												pageNum = currentPage - 2 + i;
											}

											return (
												<PaginationItem key={pageNum}>
													<PaginationLink
														onClick={() => setCurrentPage(pageNum)}
														isActive={currentPage === pageNum}
														className="cursor-pointer"
													>
														{pageNum}
													</PaginationLink>
												</PaginationItem>
											);
										}
									)}

									{totalPages > 5 && currentPage < totalPages - 2 && (
										<>
											<PaginationItem>
												<PaginationEllipsis />
											</PaginationItem>
											<PaginationItem>
												<PaginationLink
													onClick={() => setCurrentPage(totalPages)}
													className="cursor-pointer"
												>
													{totalPages}
												</PaginationLink>
											</PaginationItem>
										</>
									)}

									<PaginationItem>
										<PaginationNext
											onClick={() =>
												setCurrentPage((prev) => Math.min(prev + 1, totalPages))
											}
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
			</div>
		</>
	);
}
