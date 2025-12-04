'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
	name: string;
	description: string;
	link: string;
	iconLight: string;
	iconDark: string;
}

export default function Project() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const { theme, resolvedTheme } = useTheme();

	useEffect(() => {
		async function fetchProjects() {
			try {
				const res = await fetch('/api/project');
				if (!res.ok) throw new Error('获取项目列表失败');
				const data = await res.json();
				setProjects(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : '未知错误');
			} finally {
				setLoading(false);
			}
		}
		fetchProjects();
	}, []);

	return (
		<>
			<div className="border-b">
				<section className="bg-diagonal-stripes-sm bg-background">
					<div className="py-2 text-center sm:py-4">
						<span className="text-accent-foreground px-4 py-1 text-lg font-medium sm:text-2xl">
							作品集
						</span>
					</div>
				</section>
			</div>

			{/* 项目列表区域 */}
			<div className="border-b">
				<section className="section-base p-0">
					{error && (
						<section className="px-8 py-6 text-center text-red-500">
							{`错误：${error}`}
						</section>
					)}

					{/* 骨架加载中 */}
					{loading && !error && (
						<ul className="relative m-0 grid list-none p-0">
							{[1, 2, 3].map((_, idx) => (
								<li
									key={idx}
									className="grid h-[200px] grid-cols-[0.5fr_1fr_0.5fr] border-b last:border-b-0 max-[920px]:h-[160px] max-[920px]:grid-cols-[0.5fr_1fr] max-[768px]:h-[150px] max-[768px]:grid-cols-1"
								>
									<div className="flex items-center justify-center border-r max-[768px]:hidden">
										<Skeleton className="h-12 w-12 rounded-full" />
									</div>
									<div className="flex flex-col justify-center border-r px-10 max-[768px]:items-center max-[768px]:border-r-0 max-[768px]:text-center">
										<Skeleton className="mb-2 h-8 w-40 rounded" />
										<Skeleton className="h-5 w-full max-w-[400px] rounded" />
									</div>
									<div className="bg-diagonal-stripes max-[920px]:hidden" />
								</li>
							))}
						</ul>
					)}

					{/* 加载完成 */}
					{!loading && !error && (
						<ul className="relative m-0 grid list-none p-0">
							{projects.map((project, index) => {
								const isDark =
									theme === 'dark' ||
									resolvedTheme === 'dark' ||
									typeof window === 'undefined'
										? true
										: false;
								const iconUrl = isDark ? project.iconDark : project.iconLight;

								return (
									<li
										key={index}
										className="grid h-[200px] grid-cols-[0.5fr_1fr_0.5fr] border-b last:border-b-0 max-[920px]:h-[160px] max-[920px]:grid-cols-[0.5fr_1fr] max-[768px]:h-[150px] max-[768px]:grid-cols-1"
									>
										<div className="flex items-center justify-center border-r max-[768px]:hidden">
											<Image
												src={iconUrl}
												alt={project.name}
												width={48}
												height={48}
												className="h-12 w-12"
												unoptimized
											/>
										</div>

										<a
											href={project.link}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={`访问项目：${project.name}`}
											className="flex flex-col justify-center border-r px-10 transition hover:bg-gray-50 max-[768px]:items-center max-[768px]:border-r-0 max-[768px]:text-center dark:hover:bg-black"
										>
											<h3 className="mb-2 text-2xl">{project.name}</h3>
											<p className="text-lg font-normal text-gray-500 dark:text-gray-300">
												{project.description}
											</p>
										</a>

										<div className="bg-diagonal-stripes max-[920px]:hidden"></div>
									</li>
								);
							})}
						</ul>
					)}
				</section>
			</div>
		</>
	);
}
