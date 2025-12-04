'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Highlighter, StickyNote, Send } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';

interface Social {
	name: string;
	link: string;
	icon: { light: string; dark: string };
}

interface Friend {
	name: string;
	image: string;
	description: string;
	social: Social[];
	pinned?: boolean;
}

// 无动画灰色占位块，用于接口返回空数据时显示
function PlaceholderBlock({
	className,
	style,
}: {
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<div
			className={`${className} bg-gray-300 select-none dark:bg-gray-700`}
			style={style}
			aria-hidden="true"
		/>
	);
}

// 骨架屏动画版虚拟占位（带动画）
function FriendPlaceholder({
	isPinned = false,
	isReversed = false,
}: {
	isPinned?: boolean;
	isReversed?: boolean;
}) {
	if (isPinned) {
		return (
			<div
				className={`flex items-center gap-4 sm:gap-6 ${
					isReversed ? 'flex-row-reverse text-right' : 'flex-row'
				}`}
			>
				<Skeleton
					className="rounded-full border-2 border-gray-300 dark:border-gray-600"
					style={{ width: 150, height: 150 }}
				/>
				<div
					className={`max-w-lg space-y-2 ${
						isReversed ? 'ml-auto text-right' : ''
					}`}
				>
					<Skeleton className={`h-6 w-32 ${isReversed ? 'ml-auto' : ''}`} />
					<Skeleton
						className={`h-4 w-full max-w-[300px] ${
							isReversed ? 'ml-auto' : ''
						}`}
					/>
					<div
						className={`flex gap-3 ${
							isReversed ? 'justify-end' : 'justify-start'
						}`}
					>
						<Skeleton className="h-5 w-5 rounded-full" />
						<Skeleton className="h-5 w-5 rounded-full" />
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<div className="flex w-40 flex-col items-center space-y-2 text-center">
				<Skeleton
					className="rounded-full border-2 border-gray-300 dark:border-gray-600"
					style={{ width: 90, height: 90 }}
				/>
				<Skeleton className="mx-auto h-4 w-20" />
				<Skeleton className="mx-auto h-3 w-24" />
				<div className="flex justify-center gap-2">
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-5 w-5 rounded-full" />
				</div>
			</div>
		);
	}
}

// 加载完成但无数据时显示的静态灰色占位块
function FriendPlaceholderStatic({
	isPinned = false,
	isReversed = false,
}: {
	isPinned?: boolean;
	isReversed?: boolean;
}) {
	if (isPinned) {
		return (
			<div
				className={`flex items-center gap-4 sm:gap-6 ${
					isReversed ? 'flex-row-reverse text-right' : 'flex-row'
				}`}
			>
				<PlaceholderBlock
					className="rounded-full border-2 border-gray-300 dark:border-gray-600"
					style={{ width: 150, height: 150 }}
				/>
				<div
					className={`max-w-lg space-y-2 ${
						isReversed ? 'ml-auto text-right' : ''
					}`}
				>
					<PlaceholderBlock
						className={`h-6 w-32 rounded ${isReversed ? 'ml-auto' : ''}`}
					/>
					<PlaceholderBlock
						className={`h-4 w-full max-w-[300px] rounded ${
							isReversed ? 'ml-auto' : ''
						}`}
					/>
					<div
						className={`flex gap-3 ${
							isReversed ? 'justify-end' : 'justify-start'
						}`}
					>
						<PlaceholderBlock className="h-5 w-5 rounded-full" />
						<PlaceholderBlock className="h-5 w-5 rounded-full" />
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<div className="flex w-40 flex-col items-center space-y-2 text-center">
				<PlaceholderBlock
					className="rounded-full border-2 border-gray-300 dark:border-gray-600"
					style={{ width: 90, height: 90 }}
				/>
				<PlaceholderBlock className="mx-auto h-4 w-20 rounded" />
				<PlaceholderBlock className="mx-auto h-3 w-24 rounded" />
				<div className="flex justify-center gap-2">
					<PlaceholderBlock className="h-5 w-5 rounded-full" />
					<PlaceholderBlock className="h-5 w-5 rounded-full" />
				</div>
			</div>
		);
	}
}

export default function LinkMain() {
	const { resolvedTheme } = useTheme();
	const [friends, setFriends] = useState<Friend[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch('/api/friend')
			.then((res) => {
				if (!res.ok) throw new Error('获取友链失败');
				return res.json();
			})
			.then(
				(
					data: {
						name: string;
						image: string;
						description: string;
						pinned?: boolean;
						socialLinks: {
							name: string;
							link: string;
							iconLight: string;
							iconDark: string;
						}[];
					}[]
				) => {
					const mapped = data.map((friend) => ({
						name: friend.name,
						image: friend.image,
						description: friend.description,
						pinned: friend.pinned,
						social: friend.socialLinks.map((s) => ({
							name: s.name,
							link: s.link,
							icon: {
								light: s.iconLight,
								dark: s.iconDark,
							},
						})),
					}));
					setFriends(mapped);
				}
			)
			.catch((err) => {
				console.error(err);
			})
			.finally(() => setLoading(false));
	}, []);

	const pinnedFriends = friends.filter((f) => f.pinned);
	const otherFriends = friends.filter((f) => !f.pinned);

	const showPinnedPlaceholder = !loading && pinnedFriends.length === 0;
	const showOtherPlaceholder = !loading && otherFriends.length === 0;

	return (
		<>
			<div className="border-b">
				<section className="section-base">
					<div className="mx-auto max-w-4xl space-y-10 p-6 sm:space-y-12 sm:p-8">
						{/* pinned 区块 */}
						<h2 className="mb-6 text-center text-xl font-light tracking-widest sm:mb-8 sm:text-2xl">
							Respected
						</h2>
						<div className="space-y-8 sm:space-y-10">
							{loading
								? Array.from({ length: 2 }).map((_, idx) => (
										<FriendPlaceholder
											key={idx}
											isPinned
											isReversed={idx % 2 !== 0}
										/>
									))
								: showPinnedPlaceholder
									? Array.from({ length: 2 }).map((_, idx) => (
											<FriendPlaceholderStatic
												key={idx}
												isPinned
												isReversed={idx % 2 !== 0}
											/>
										))
									: pinnedFriends.map((friend, idx) => (
											<div
												key={idx}
												className={`flex items-center gap-4 sm:gap-6 ${
													idx % 2 === 0
														? 'flex-row'
														: 'flex-row-reverse text-right'
												}`}
											>
												<Image
													src={friend.image}
													alt={friend.name}
													width={90}
													height={90}
													className="rounded-full border-2 border-gray-300 object-cover sm:h-[150px] sm:w-[150px]"
													unoptimized
													priority
												/>
												<div className="max-w-lg">
													<h3 className="text-xl font-semibold sm:text-3xl">
														{friend.name}
													</h3>
													<p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base dark:text-gray-400">
														{friend.description}
													</p>
													<div
														className={`mt-3 flex gap-3 sm:mt-4 ${
															idx % 2 === 0 ? 'justify-start' : 'justify-end'
														}`}
													>
														{friend.social.map((social, i) => (
															<a
																key={i}
																href={social.link}
																target="_blank"
																rel="noopener noreferrer"
																aria-label={social.name}
															>
																<Image
																	src={
																		resolvedTheme === 'dark'
																			? social.icon.dark
																			: social.icon.light
																	}
																	alt={social.name}
																	width={20}
																	height={20}
																	className="transition hover:opacity-80"
																	unoptimized
																/>
															</a>
														))}
													</div>
												</div>
											</div>
										))}
						</div>

						{/* other 区块 */}
						<h2 className="mb-6 text-center text-xl font-light tracking-widest sm:mb-8 sm:text-2xl">
							Precious
						</h2>
						<div className="flex flex-wrap justify-center gap-4 sm:gap-8">
							{loading
								? Array.from({ length: 4 }).map((_, idx) => (
										<FriendPlaceholder key={idx} />
									))
								: showOtherPlaceholder
									? Array.from({ length: 4 }).map((_, idx) => (
											<FriendPlaceholderStatic key={idx} />
										))
									: otherFriends.map((friend, idx) => (
											<div
												key={idx}
												className="flex w-24 flex-col items-center text-center sm:w-40"
											>
												<Image
													src={friend.image}
													alt={friend.name}
													width={60}
													height={60}
													className="rounded-full border-2 border-gray-300 object-cover sm:h-[90px] sm:w-[90px]"
													unoptimized
													priority
												/>
												<h4 className="mt-2 text-base font-semibold sm:mt-3 sm:text-lg">
													{friend.name}
												</h4>
												<p className="mt-1 text-xs text-gray-500 sm:text-sm">
													{friend.description}
												</p>
												<div className="mt-2 flex space-x-3">
													{friend.social.map((social, i) => (
														<a
															key={i}
															href={social.link}
															target="_blank"
															rel="noopener noreferrer"
															aria-label={social.name}
														>
															<Image
																src={
																	resolvedTheme === 'dark'
																		? social.icon.dark
																		: social.icon.light
																}
																alt={social.name}
																width={20}
																height={20}
																className="transition hover:opacity-80"
																unoptimized
															/>
														</a>
													))}
												</div>
											</div>
										))}
						</div>
					</div>
				</section>
			</div>

			<div className="border-b">
				<section className="section-base">
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="item-1">
							<div className="flex flex-col px-4 py-1 sm:px-8 sm:py-2">
								<AccordionTrigger className="hover:bg-accent cursor-pointer p-2 hover:no-underline">
									<h1 className="text-xl font-bold sm:text-2xl">
										如何加入友链？
									</h1>
								</AccordionTrigger>
								<AccordionContent>
									<ul className="list-decimal space-y-1 pl-6 text-base text-gray-700 marker:text-gray-400 sm:pl-8 sm:text-lg dark:text-gray-300">
										<li>
											确保<strong>内容活跃</strong>，有足够的阅读量；
										</li>
										<li>
											<strong>不轻易弃坑</strong>，保持存活与互联网之中；
										</li>
										<li>
											内容要求<strong>不得违反</strong>国家法律法规，
											<strong>不涉及</strong>政治敏感内容；
										</li>
									</ul>
									<ul className="text-base text-gray-700 sm:text-lg dark:text-gray-300">
										<li className="relative pl-10 before:absolute before:left-0 before:text-gray-400 before:content-['OR.']">
											<strong>
												<em>
													<s>成为我的朋友 ξ( ✿＞◡❛)；</s>
												</em>
											</strong>
										</li>
									</ul>
								</AccordionContent>
							</div>
						</AccordionItem>

						<AccordionItem value="item-2">
							<div className="flex flex-col px-4 py-1 sm:px-8 sm:py-2">
								<AccordionTrigger className="hover:bg-accent cursor-pointer p-2 hover:no-underline">
									<h1 className="text-xl font-bold sm:text-2xl">
										如何申请友链？
									</h1>
								</AccordionTrigger>
								<AccordionContent>
									<ul className="text-base break-words text-gray-700 sm:text-lg dark:text-gray-300">
										<li className="flex items-start gap-1.5 sm:gap-2">
											<Highlighter className="mt-1 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
											<span>
												<strong>内容包含</strong>
												：头像、名称、介绍、链接、以及社交账号地址；
											</span>
										</li>
										<li className="flex items-start gap-1.5 sm:gap-2">
											<StickyNote className="mt-1 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
											<span>
												<strong>邮箱主题</strong>
												：友链申请，我将在第一时间审核并添加到友链栏目中。
											</span>
										</li>
										<li className="flex items-start gap-1.5 sm:gap-2">
											<Send className="mt-1 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
											<span>
												<strong>邮箱地址</strong>：
												<a
													href="mailto:me@ichiyo.in"
													className="break-all hover:underline"
												>
													me@ichiyo.in
												</a>
											</span>
										</li>
									</ul>
								</AccordionContent>
							</div>
						</AccordionItem>
					</Accordion>
				</section>
			</div>
		</>
	);
}
