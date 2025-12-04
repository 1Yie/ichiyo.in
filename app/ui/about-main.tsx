'use client';

import { use, Suspense } from 'react';
import { Carousel } from '@/components/ui/carousel';
import TiltedCard from '@/components/ui/tilted-card';
import { Skeleton } from '@/components/ui/skeleton';
import { request } from '@/hooks/use-request';
import {
	SiReact,
	SiNextdotjs,
	SiTypescript,
	SiTailwindcss,
	SiHtml5,
	SiCss3,
	SiJavascript,
	SiVuedotjs,
	SiNodedotjs,
	SiMysql,
} from 'react-icons/si';
import Image from 'next/image';

import { RiJavaLine } from 'react-icons/ri';

import BunLogo from '@/public/img/wordmark.svg';
import Project from './home-project';

interface SlideData {
	title: string;
	src: string;
	button?: string;
	link?: string;
}

const getSlides = request<SlideData[]>('/api/pic');

function SlidesLoader() {
	const slides = use(getSlides);

	return (
		<div className="relative flex h-full min-h-[400px] w-full items-center justify-center overflow-hidden py-20">
			<Carousel slides={slides} />
		</div>
	);
}

function SkillStack() {
	const skills = [
		{
			name: 'HTML',
			icon: <SiHtml5 className="h-6 w-6 text-orange-400 sm:h-12 sm:w-12" />,
		},
		{
			name: 'CSS',
			icon: <SiCss3 className="h-6 w-6 text-blue-400 sm:h-12 sm:w-12" />,
		},
		{
			name: 'JavaScript',
			icon: (
				<SiJavascript className="h-6 w-6 text-yellow-400 sm:h-12 sm:w-12" />
			),
		},
		{
			name: 'TypeScript',
			icon: <SiTypescript className="h-6 w-6 text-blue-500 sm:h-12 sm:w-12" />,
		},
		{
			name: 'Tailwind CSS',
			icon: <SiTailwindcss className="h-6 w-6 text-sky-400 sm:h-12 sm:w-12" />,
		},
		{
			name: 'React',
			icon: <SiReact className="h-6 w-6 text-cyan-400 sm:h-12 sm:w-12" />,
		},
		{
			name: 'Vue',
			icon: <SiVuedotjs className="h-6 w-6 text-green-600 sm:h-12 sm:w-12" />,
		},
		{
			name: 'Next.js',
			icon: (
				<SiNextdotjs className="h-6 w-6 text-black sm:h-12 sm:w-12 dark:text-white" />
			),
		},
		{
			name: 'Node.js',
			icon: <SiNodedotjs className="h-6 w-6 text-green-700 sm:h-12 sm:w-12" />,
		},
		{
			name: 'Bun',
			icon: (
				<Image
					src={BunLogo}
					alt="Bun Logo"
					className="h-6 w-6 sm:h-12 sm:w-12"
				/>
			),
		},
		{
			name: 'Java',
			icon: <RiJavaLine className="h-6 w-6 text-red-500 sm:h-12 sm:w-12" />,
		},
		{
			name: 'MySQL',
			icon: <SiMysql className="h-6 w-6 text-yellow-500 sm:h-12 sm:w-12" />,
		},
	];

	return (
		<div className="border-b">
			<section className="section-base bg-accent/10 relative">
				<div className="relative mx-auto max-w-xl p-2">
					{/* 九宫格 */}
					<div className="relative z-10 grid grid-cols-3 gap-0">
						{skills.map((skill, index, arr) => {
							const cols = 3;
							const total = arr.length;
							const lastRowStart = Math.floor((total - 1) / cols) * cols;
							const isLastRow = index >= lastRowStart;
							return (
								<div
									key={index}
									className={`hover:bg-accent/50 flex aspect-square flex-col items-center justify-center border-dashed border-gray-300 transition-colors duration-300 dark:border-gray-800 ${index % cols !== cols - 1 ? 'border-r' : ''} ${!isLastRow ? 'border-b' : ''} `}
								>
									{skill.icon}
									<span className="mt-1 text-sm">{skill.name}</span>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</div>
	);
}

export default function AboutMain() {
	return (
		<>
			<div className="border-b">
				<section className="section-base">
					<div className="flex flex-col gap-5 p-12">
						<TiltedCard
							imageSrc="https://dn-qiniu-avatar.qbox.me/avatar/d81d2d77f4683131d6bca4c3b5e5ab39?s=128&d=identicon"
							containerHeight="100px"
							containerWidth="100px"
							imageHeight="100px"
							imageWidth="100px"
							rotateAmplitude={20}
							scaleOnHover={1.1}
							showMobileWarning={false}
							showTooltip={false}
						/>

						<div className="flex flex-col gap-2">
							<span>
								<h1 className="mr-2 inline-block text-4xl font-bold">ichiyo</h1>
								<h1 className="inline-block text-lg">
									取自罗马音一葉（Ichiyō）为名。
								</h1>
							</span>
						</div>
					</div>
				</section>
			</div>

			<div className="border-b">
				<section className="bg-diagonal-stripes-sm bg-background">
					<div className="py-2 text-center sm:py-4">
						<span className="text-accent-foreground px-4 py-1 text-lg font-medium sm:text-2xl">
							技术栈
						</span>
					</div>
				</section>
			</div>

			<SkillStack />

			<Project />

			<div className="border-b">
				<section className="bg-diagonal-stripes-sm bg-background">
					<div className="py-2 text-center sm:py-4">
						<span className="text-accent-foreground px-4 py-1 text-lg font-medium sm:text-2xl">
							相册集
						</span>
					</div>
				</section>
			</div>

			<div className="border-b">
				<section className="section-base">
					<Suspense
						fallback={
							<div className="relative flex h-full min-h-[400px] w-full items-center justify-center overflow-hidden py-20">
								<div className="h-[70vmin] w-[70vmin]">
									<Skeleton className="h-full w-full rounded-xl" />
								</div>
							</div>
						}
					>
						<SlidesLoader />
					</Suspense>
				</section>
			</div>
		</>
	);
}
