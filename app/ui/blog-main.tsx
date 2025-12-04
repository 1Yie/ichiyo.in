'use client';

import { Suspense, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import PostsList from '@/ui/posts-list';
import BlogPanel from '@/ui/blog-panel';

export default function BlogMain() {
	const [currentPage, setCurrentPage] = useState(1);

	return (
		<>
			<BlogPanel />
			<Suspense
				fallback={
					<div className="border-b">
						<section className="section-base">
							<div className="space-y-6 p-4">
								{Array.from({ length: 2 }).map((_, i) => (
									<div
										key={i}
										className="space-y-2 border-b border-gray-200 pb-4 last:border-b-0 dark:border-gray-700"
									>
										<Skeleton className="h-7 w-3/4 rounded-md" />
										<Skeleton className="h-5 w-1/3 rounded-md" />
									</div>
								))}
							</div>
						</section>
					</div>
				}
			>
				<PostsList currentPage={currentPage} setCurrentPage={setCurrentPage} />
			</Suspense>
		</>
	);
}
