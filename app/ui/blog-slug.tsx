'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Comments from '@/components/ui/comment';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	AlertDialogCancel,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import ErrorBoundary from '@/ui/error-boundary';
import type { PostBySlug } from '@/types/post';
import ScrollToTopButton from '@/ui/scroll-to-top-button';

function dayDiff(d1: Date, d2: Date) {
	const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
	const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
	return Math.floor(
		(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
	);
}

function timeDiffText(
	createdAt: string,
	updatedAt: string,
	post: PostBySlug,
	htmlContent: string
) {
	const created = new Date(createdAt);
	const updated = new Date(updatedAt);
	const now = new Date();

	const createdDiffDays = dayDiff(created, now);
	const updatedDiffDays = dayDiff(updated, now);

	const textContent = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
	const wordCount = textContent.length;

	const formatDate = (d: Date) =>
		`${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
			.getDate()
			.toString()
			.padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d
			.getMinutes()
			.toString()
			.padStart(2, '0')}`;

	const formatDateShort = (d: Date) =>
		`${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
			.getDate()
			.toString()
			.padStart(2, '0')}`;

	const createdText =
		createdDiffDays <= 7
			? createdDiffDays === 0
				? '今天'
				: `${createdDiffDays} 天前`
			: formatDateShort(created);

	const updatedText =
		updatedDiffDays <= 7
			? updatedDiffDays === 0
				? '今天'
				: `${updatedDiffDays} 天前`
			: formatDateShort(updated);

	const isUpdated = updated.getTime() > created.getTime();
	const showUpdated = isUpdated && createdText !== updatedText;

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<div className="inline-flex cursor-pointer flex-wrap items-center gap-4 text-sm text-gray-600 sm:gap-6 sm:text-base dark:text-gray-400">
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="flex items-center gap-1.5 transition-colors hover:text-gray-900 dark:hover:text-gray-200">
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>{createdText}</span>
							</span>
						</TooltipTrigger>
						<TooltipContent>创建于 {formatDate(created)}</TooltipContent>
					</Tooltip>

					{showUpdated && (
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="flex items-center gap-1.5 transition-colors hover:text-gray-900 dark:hover:text-gray-200">
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
									<span>{updatedText}</span>
								</span>
							</TooltipTrigger>
							<TooltipContent>更新于 {formatDate(updated)}</TooltipContent>
						</Tooltip>
					)}
				</div>
			</AlertDialogTrigger>

			<AlertDialogContent className="sm:max-w-[500px]">
				<AlertDialogHeader>
					<AlertDialogTitle>文章 Meta</AlertDialogTitle>
				</AlertDialogHeader>
				<div className="space-y-3 py-2">
					<div className="space-y-3">
						<div className="flex flex-col gap-1">
							<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
								标题
							</div>
							<div className="text-base font-semibold">{post.title}</div>
						</div>

						<div className="flex flex-col gap-1">
							<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
								作者
							</div>
							<div className="text-sm">
								{post.authors && post.authors.length > 0
									? post.authors.map((a) => a.id).join(', ')
									: '匿名'}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1">
								<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
									创建时间
								</div>
								<div className="font-mono text-sm">{formatDate(created)}</div>
							</div>

							<div className="flex flex-col gap-1">
								<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
									更新时间
								</div>
								<div className="font-mono text-sm">
									{Math.abs(updated.getTime() - created.getTime()) < 60 * 1000
										? '-'
										: formatDate(updated)}
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
								文章字数
							</div>
							<div className="text-sm">{wordCount.toLocaleString()} 字</div>
						</div>

						{post.tags && post.tags.length > 0 && (
							<div className="flex flex-col gap-1.5">
								<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
									标签
								</div>
								<div className="flex flex-wrap gap-1.5">
									{post.tags.map((tag) => (
										<Link
											key={tag.id}
											href={`/tags/${encodeURIComponent(tag.name)}`}
											className="bg-accent hover:bg-accent/80 inline-flex cursor-pointer items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
										>
											<span className="text-muted-foreground mr-1">#</span>
											{tag.name}
										</Link>
									))}
								</div>
							</div>
						)}

						<div className="flex flex-col gap-1">
							<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
								Slug
							</div>
							<button
								onClick={() => {
									const url = `${window.location.origin}/blog/${post.slug}`;
									navigator.clipboard.writeText(url).then(() => {
										toast.success('链接已复制到剪贴板');
									});
								}}
								className="text-muted-foreground bg-muted/50 hover:bg-muted cursor-pointer rounded px-2 py-1.5 text-left font-mono text-xs break-all transition-colors"
							>
								{post.slug}
							</button>
						</div>

						<div className="flex flex-col gap-1.5 border-t pt-2">
							<div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
								版权说明
							</div>
							<div className="text-muted-foreground space-y-1 text-xs leading-relaxed">
								<p>
									本文采用{' '}
									<a
										href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground cursor-pointer font-medium hover:underline"
									>
										CC BY-NC-SA 4.0
									</a>{' '}
									协议
								</p>
								<p>转载请注明出处并保留原文链接</p>
							</div>
						</div>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>关闭</AlertDialogCancel>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function LoadingSkeleton() {
	return (
		<div className="border-b">
			<section className="section-base p-12">
				<div className="space-y-4">
					<Skeleton className="h-10 w-3/4" />
					<Skeleton className="h-6 w-1/4" />
					<Skeleton className="h-5 w-1/6" />
				</div>
			</section>
			<section className="section-base px-[120px] py-[20px] max-[768px]:px-[20px] max-[768px]:py-[30px]">
				<div className="space-y-3">
					{Array.from({ length: 10 }).map((_, i) => (
						<Skeleton key={i} className="h-4 w-full" />
					))}
				</div>
			</section>
		</div>
	);
}

function PostContent({
	post,
	htmlContent,
}: {
	post: PostBySlug;
	htmlContent: string;
}) {
	return (
		<>
			<ScrollToTopButton />
			<div className="border-b">
				<section className="section-base bg-squares relative p-12">
					<h1 className="mt-2 mb-2 text-3xl font-bold sm:text-4xl">
						{post.title}
					</h1>
					<p className="mb-3 text-lg text-gray-600 sm:text-2xl dark:text-gray-300">
						{post.authors && post.authors.length > 0
							? post.authors.map((a) => a.id).join(', ')
							: '匿名'}
					</p>

					{timeDiffText(post.createdAt, post.updatedAt, post, htmlContent)}

					{post.tags && post.tags.length > 0 && (
						<div className="mt-4 flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<Link
									key={tag.id}
									href={`/tags/${encodeURIComponent(tag.name)}`}
									className="bg-accent text-accent-foreground hover:bg-accent/80 inline-flex cursor-pointer items-center rounded-full px-3 py-1 text-sm font-medium transition"
								>
									<span className="text-accent-foreground/60 mr-1 select-none">
										#
									</span>
									{tag.name}
								</Link>
							))}
						</div>
					)}
				</section>
			</div>

			<div className="border-b">
				<section className="section-base">
					<div
						className="post-style px-[120px] py-[20px] leading-relaxed max-[768px]:px-[20px] max-[768px]:py-[30px]"
						dangerouslySetInnerHTML={{
							__html: htmlContent.replace(/<img/g, '<img data-zoom="true"'),
						}}
					/>
				</section>
			</div>

			<div className="border-b">
				<section className="section-base artalk p-[50px_120px] max-[768px]:p-[20px_30px]">
					<Comments />
				</section>
			</div>
		</>
	);
}

export default function BlogSlug({
	post,
	htmlContent,
}: {
	post: PostBySlug;
	htmlContent: string;
}) {
	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<ErrorBoundary fallback={null}>
				<PostContent post={post} htmlContent={htmlContent} />
			</ErrorBoundary>
		</Suspense>
	);
}
