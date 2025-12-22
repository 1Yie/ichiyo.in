'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Heading {
	id: string;
	text: string;
	level: number;
}

export default function BlogTOC() {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [activeId, setActiveId] = useState<string>('');
	const [isLoading, setIsLoading] = useState(true);

	const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0 });
	const navRef = useRef<HTMLUListElement>(null);

	const isManualScrolling = useRef(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			const elements = Array.from(
				document.querySelectorAll(
					'.post-style h1, .post-style h2, .post-style h3, .post-style h4, .post-style h5, .post-style h6, .footnotes'
				)
			);

			const items = elements
				.map((elem, index) => {
					if (!elem.id) elem.id = `heading-${index}`;
					const clone = elem.cloneNode(true) as HTMLElement;
					clone.querySelectorAll?.('.anchor-link')?.forEach((n) => n.remove());
					let text = (clone.textContent || '').trim();
					if (elem.classList.contains('footnotes')) text = 'Footnotes';

					return {
						id: elem.id,
						text,
						level: elem.classList.contains('footnotes')
							? 1
							: parseInt(elem.tagName.substring(1)) || 1,
					};
				})
				.filter(
					(item, index, self) =>
						item.text !== '' &&
						(item.text !== 'Footnotes' ||
							self.findIndex((i) => i.text === 'Footnotes') === index)
				);

			setHeadings(items);
			setIsLoading(false);

			const observer = new IntersectionObserver(
				(entries) => {
					if (isManualScrolling.current) return;

					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							setActiveId(entry.target.id);
						}
					});
				},
				{ rootMargin: '-100px 0px -66% 0px' }
			);

			elements.forEach((elem) => observer.observe(elem));
			return () => observer.disconnect();
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (!activeId || !navRef.current) return;
		const activeElement = navRef.current.querySelector(
			`[data-id="${CSS.escape(activeId)}"]`
		) as HTMLElement;
		if (activeElement) {
			setIndicatorStyle({
				top: activeElement.offsetTop,
				height: activeElement.offsetHeight,
			});
		}
	}, [activeId, headings]);

	if (isLoading) {
		return (
			<div className="space-y-4 border-r border-transparent pl-4">
				<Skeleton className="h-4 w-[120px]" />
				<div className="space-y-2.5">
					<Skeleton className="h-3 w-[150px]" />
					<Skeleton className="ml-3 h-3 w-[130px]" />
					<Skeleton className="ml-3 h-3 w-[140px]" />
					<Skeleton className="h-3 w-[110px]" />
				</div>
			</div>
		);
	}

	if (headings.length === 0) return null;

	return (
		<nav className="text-sm">
			<ul ref={navRef} className="border-muted relative space-y-2.5 border-r">
				<div
					className="bg-foreground absolute right-[-1px] w-[2px] transition-all duration-300 ease-in-out"
					style={{
						height: indicatorStyle.height,
						transform: `translateY(${indicatorStyle.top}px)`,
						top: 0,
						opacity: activeId ? 1 : 0,
					}}
				/>

				{headings.map((heading) => (
					<li
						key={heading.id}
						data-id={heading.id}
						className="relative pr-4"
						style={{ paddingLeft: (heading.level - 1) * 12 }}
					>
						<button
							className={cn(
								'hover:text-foreground block w-full cursor-pointer py-0.5 text-left transition-colors',
								activeId === heading.id
									? 'text-foreground font-medium'
									: 'text-muted-foreground'
							)}
							onClick={() => {
								const el = document.getElementById(heading.id);
								if (el) {
									isManualScrolling.current = true;
									setActiveId(heading.id);

									const offsetTop =
										window.pageYOffset + el.getBoundingClientRect().top - 80;
									window.scrollTo({ top: offsetTop, behavior: 'smooth' });
									history.replaceState(null, '', `#${heading.id}`);

									setTimeout(() => {
										isManualScrolling.current = false;
									}, 800);
								}
							}}
						>
							<span className="line-clamp-2">{heading.text}</span>
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}
