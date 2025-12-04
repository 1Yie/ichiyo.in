'use client';

import { useState, Suspense, use } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { request } from '@/hooks/use-request';
import ErrorBoundary from '@/ui/error-boundary';
import type { Post } from '@/types/post';
import { debouncePromise } from '@/lib/debounce';

// 原始请求函数
function fetchSearchResults(query: string): Promise<Post[]> {
	if (!query.trim()) return Promise.resolve([]);
	return request<Post[]>(`/api/post/search`, {
		params: { q: query },
	});
}

// 包装成防抖版本
const debouncedFetchSearchResults = debouncePromise(fetchSearchResults, 500);

function SearchResults({ searchPromise }: { searchPromise: Promise<Post[]> }) {
	const router = useRouter();
	const searchResults = use(searchPromise);

	if (searchResults.length === 0) {
		return (
			<div className="py-4 text-center">
				<p className="text-muted-foreground text-sm">暂无搜索结果</p>
			</div>
		);
	}

	return (
		<ul className="divide-y">
			{searchResults.map((post) => (
				<li key={post.id} className="hover:bg-muted/50 transition-colors">
					<Link href={`/blog/${post.slug}`} className="block p-2 sm:p-3">
						<h3 className="text-foreground line-clamp-2 text-sm font-medium sm:text-base">
							{post.title}
						</h3>
						<p className="text-muted-foreground text-xs">
							{post.authors.map((author) => author.id).join(' · ')}
						</p>
						<div className="my-1 flex flex-wrap gap-1">
							{post.tags.slice(0, 5).map((tag) => (
								<span
									key={tag.id}
									className="bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 text-xs"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										router.push(`/tags/${encodeURIComponent(tag.name)}`);
									}}
								>
									#{tag.name}
								</span>
							))}
							{post.tags.length > 5 && (
								<span className="text-muted-foreground text-xs">
									+{post.tags.length - 5}个标签
								</span>
							)}
						</div>
						<p className="text-muted-foreground mt-1 text-xs">
							{new Date(post.createdAt).toLocaleDateString()}
						</p>
					</Link>
				</li>
			))}
		</ul>
	);
}

export default function BlogSearch() {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchPromise, setSearchPromise] = useState<Promise<Post[]>>(
		Promise.resolve([])
	);
	const [showResults, setShowResults] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchQuery(value);
		setShowResults(value.trim().length > 0);

		if (value.trim()) {
			setSearchPromise(debouncedFetchSearchResults(value));
		} else {
			setSearchPromise(Promise.resolve([]));
		}
	};

	const clearSearch = () => {
		setSearchQuery('');
		setShowResults(false);
		setSearchPromise(Promise.resolve([]));
	};

	return (
		<div className="relative w-full">
			<div className="relative">
				<div className="bg-background hover:border-foreground/50 focus-within:border-foreground/50 flex items-center overflow-hidden rounded-lg border transition-all duration-300">
					<div className="pl-2 sm:pl-3">
						<Search size={18} className="text-muted-foreground" />
					</div>
					<input
						type="text"
						value={searchQuery}
						onChange={handleChange}
						placeholder="搜索文章 标题 / 内容 / 标签"
						className="placeholder:text-muted-foreground w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-sm sm:py-2 sm:text-base"
					/>
					<div
						className={cn(
							'flex items-center overflow-hidden transition-all duration-300',
							searchQuery ? 'w-[40px]' : 'w-0'
						)}
					>
						<button
							onClick={clearSearch}
							className="text-muted-foreground hover:text-foreground cursor-pointer"
						>
							<X size={18} />
						</button>
					</div>
				</div>
			</div>

			{showResults && searchQuery && (
				<div className="bg-background absolute top-full right-0 left-0 z-50 mt-1 max-h-[300px] overflow-hidden rounded-lg border shadow-lg">
					<div className="max-h-[300px] overflow-y-auto">
						<Suspense
							fallback={
								<div className="space-y-3 p-3">
									<Skeleton className="h-5 w-3/4 sm:h-6" />
									<Skeleton className="h-5 w-1/2 sm:h-6" />
									<Skeleton className="h-5 w-2/3 sm:h-6" />
								</div>
							}
						>
							<ErrorBoundary
								fallback={
									<div className="py-4 text-center">
										<p className="text-muted-foreground text-sm">搜索失败</p>
									</div>
								}
							>
								<SearchResults searchPromise={searchPromise} />
							</ErrorBoundary>
						</Suspense>
					</div>
				</div>
			)}
		</div>
	);
}
