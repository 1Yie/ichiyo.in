'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface Tag {
	id: number;
	name: string;
	postCount: number;
}

export default function TagsMain() {
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		async function fetchTags() {
			try {
				const res = await fetch('/api/tags');
				if (!res.ok) throw new Error('获取标签失败');
				const data = await res.json();
				setTags(data.tags);
			} catch (err) {
				console.error(err);
				setError('加载标签失败');
			} finally {
				setLoading(false);
			}
		}

		fetchTags();
	}, []);

	const validTags = tags.filter((tag) => tag.postCount >= 1);

	return (
		<div className="border-b">
			<section className="section-base p-12">
				{loading && (
					<div className="flex flex-wrap gap-2">
						{[...Array(6)].map((_, i) => (
							<Skeleton key={i} className="h-8 w-[100px] rounded-full" />
						))}
					</div>
				)}

				{error && (
					<span className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-lg">
						{error}
					</span>
				)}

				{!loading && !error && (
					<div className="flex flex-wrap gap-2">
						{validTags.length === 0 ? (
							<span className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-lg">
								暂无标签
							</span>
						) : (
							validTags.map((tag) => (
								<Link
									key={tag.id}
									href={`/tags/${encodeURIComponent(tag.name)}`}
									className="bg-accent text-accent-foreground hover:bg-accent/80 rounded-full px-3 py-1 text-lg transition-colors duration-300"
								>
									{tag.name} ({tag.postCount})
								</Link>
							))
						)}
					</div>
				)}
			</section>
		</div>
	);
}
