'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
} from '@/components/ui/select';
import { FontStyleToggleGroup } from '@/ui/font-style-toggle-group';
import { PostContentEditor } from '@/ui/post-content-editor';
import { toast } from 'sonner';
import { request } from '@/hooks/use-request';
import { Me, UsersResponse } from '@/types/user';
import DashboardLayout from '@/ui/dashboard-layout';

export default function DashboardNewPost() {
	const router = useRouter();
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const [title, setTitle] = useState('');
	const [slug, setSlug] = useState('');
	const [content, setContent] = useState('');
	const [published, setPublished] = useState(false);
	const [saving, setSaving] = useState(false);
	const [headingLevel, setHeadingLevel] = useState<string>('');

	const [tagInput, setTagInput] = useState('');
	const [tags, setTags] = useState<string[]>([]);

	const [showErrorDialog, setShowErrorDialog] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const [myUid, setMyUid] = useState<string | null>(null);
	const [allUsers, setAllUsers] = useState<
		{ uid: number; id: string; email: string }[]
	>([]);
	const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
	const [usersLoaded, setUsersLoaded] = useState(false);

	useEffect(() => {
		const loadUserData = async () => {
			if (usersLoaded) return;

			try {
				const meRes = await request<Me>('/api/me', { credentials: 'include' });
				const meData = meRes;

				if (meData?.authenticated && meData.user?.uid != null) {
					const uid = String(meData.user.uid);
					setMyUid(uid);
					setSelectedAuthors([uid]);
				}

				const usersRes = await request<UsersResponse>('/api/users', {
					credentials: 'include',
				});

				if (usersRes && usersRes.users) {
					setAllUsers(usersRes.users);
				}

				setUsersLoaded(true);
			} catch (error) {
				toast.error('加载用户数据失败');
				console.error('加载用户数据失败:', error);
			}
		};

		loadUserData();
	}, [usersLoaded]);

	const handleAddAuthor = (uid: string) => {
		if (!selectedAuthors.includes(uid)) {
			setSelectedAuthors([...selectedAuthors, uid]);
		}
	};

	const handleRemoveAuthor = (uid: string) => {
		if (uid === myUid) return;
		setSelectedAuthors(selectedAuthors.filter((id) => id !== uid));
	};

	const handleAddTag = () => {
		const trimmed = tagInput.trim();
		if (trimmed && !tags.includes(trimmed)) {
			setTags([...tags, trimmed]);
		}
		setTagInput('');
	};

	const handleRemoveTag = (tag: string) => {
		setTags(tags.filter((t) => t !== tag));
	};

	const handleCreate = async () => {
		setSaving(true);
		try {
			const res = await request('/api/post', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					title,
					slug: slug.trim() || undefined,
					content,
					published,
					authors: selectedAuthors.map(Number),
					tags,
				}),
			});

			if (!res) {
				const msg = '创建失败，请重试';
				toast.error(msg);
				throw new Error(msg);
			}
			toast.success('文章创建成功');
			router.push('/dashboard/post');
		} catch (err) {
			const msg = err instanceof Error ? err.message : '创建失败，请稍后再试';
			toast.error(msg);
			setErrorMessage(msg);
			setShowErrorDialog(true);
		} finally {
			setSaving(false);
		}
	};

	return (
		<DashboardLayout
			breadcrumbs={[
				{ label: '仪表盘', href: '/dashboard' },
				{ label: '文章管理', href: '/dashboard/post' },
				{ label: '新建文章', href: '/dashboard/post/new' },
			]}
		>
			<h1 className="text-foreground/90 mb-4 text-2xl font-bold">新建文章</h1>

			<div className="mb-4">
				<label
					htmlFor="title"
					className="text-foreground/90 mb-1 block font-semibold"
				>
					标题
				</label>
				<Input
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="请输入标题"
					disabled={saving}
				/>
			</div>

			<div className="mb-4">
				<label
					htmlFor="slug"
					className="text-foreground/90 mb-1 block font-semibold"
				>
					自定义 URL Slug（可留空）
				</label>
				<Input
					id="slug"
					value={slug}
					onChange={(e) => setSlug(e.target.value)}
					placeholder="例如 how-to-use-app，留空则自动生成"
					disabled={saving}
				/>
			</div>

			<div className="mb-4">
				<label
					htmlFor="authors"
					className="text-foreground/90 mb-1 block font-semibold"
				>
					作者
				</label>
				<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
					多作者文章可添加多个作者，自己为必选且不可移除
				</p>
				<Select onValueChange={(val) => handleAddAuthor(val)} value="">
					<SelectTrigger className="w-[200px]" aria-label="选择作者添加">
						<SelectValue placeholder="添加作者" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{allUsers
								.filter(
									(u) =>
										String(u.uid) != myUid &&
										!selectedAuthors.includes(String(u.uid))
								)
								.map((user) => (
									<SelectItem key={user.uid} value={String(user.uid)}>
										{user.id} ({user.email})
									</SelectItem>
								))}
							{allUsers.filter(
								(u) =>
									String(u.uid) !== myUid &&
									!selectedAuthors.includes(String(u.uid))
							).length === 0 && (
								<div className="p-2 text-sm text-gray-400 dark:text-gray-500">
									无更多作者可添加
								</div>
							)}
						</SelectGroup>
					</SelectContent>
				</Select>

				<div className="mt-2 flex flex-wrap gap-2">
					{selectedAuthors.map((uid) => {
						const user = allUsers.find((u) => String(u.uid) === uid);
						if (!user) return null;
						const isSelf = uid === myUid;
						return (
							<div
								key={uid}
								className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm ${
									isSelf
										? 'border-gray-300 bg-gray-100 text-gray-700'
										: 'border-blue-300 bg-blue-100 text-blue-700'
								}`}
							>
								{user.id}
								{!isSelf && (
									<button
										type="button"
										onClick={() => handleRemoveAuthor(uid)}
										className="ml-1 hover:text-red-600"
										aria-label="移除作者"
									>
										×
									</button>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="mb-4">
				<label
					htmlFor="tags"
					className="text-foreground/90 mb-1 block font-semibold"
				>
					标签（可选）
				</label>
				<div className="flex gap-2">
					<Input
						id="tags"
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						placeholder="输入标签后点击添加"
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								handleAddTag();
							}
						}}
						disabled={saving}
						className="w-[200px]"
					/>
					<Button onClick={handleAddTag} type="button" disabled={saving}>
						添加
					</Button>
				</div>

				<div className="mt-2 flex flex-wrap gap-2">
					{tags.length === 0 ? (
						<div className="text-sm text-gray-500 dark:text-gray-400">
							暂无标签，可添加标签
						</div>
					) : (
						tags.map((tag) => (
							<div
								key={tag}
								className="inline-flex items-center gap-1 rounded-md border border-green-300 bg-green-100 px-2 py-0.5 text-sm text-green-700"
							>
								{tag}
								<button
									type="button"
									onClick={() => handleRemoveTag(tag)}
									className="ml-1 hover:text-red-600"
									aria-label="移除标签"
								>
									×
								</button>
							</div>
						))
					)}
				</div>
			</div>

			<div className="mb-2">
				<label
					htmlFor="content"
					className="text-foreground/90 mb-1 block font-semibold"
				>
					内容
				</label>
				<FontStyleToggleGroup
					content={content}
					setContent={setContent}
					headingLevel={headingLevel}
					onHeadingLevelChange={setHeadingLevel}
					textareaRef={textareaRef}
				/>
			</div>

			<PostContentEditor
				content={content}
				setContent={setContent}
				textareaRef={textareaRef}
				saving={saving}
				placeholder="请输入内容"
			/>

			<div className="mb-4 flex items-center gap-2">
				<Checkbox
					id="published"
					checked={published}
					onCheckedChange={(c) => setPublished(!!c)}
					disabled={saving}
				/>
				<label htmlFor="published" className="text-foreground/90">
					立即发布
				</label>
			</div>

			<div className="flex gap-2">
				<Button
					onClick={handleCreate}
					disabled={saving}
					className="disabled:opacity-50"
				>
					{saving ? '创建中...' : '创建'}
				</Button>
				<Button
					onClick={() => router.push('/dashboard/post')}
					variant="outline"
					disabled={saving}
					className="disabled:opacity-50"
				>
					取消
				</Button>
			</div>

			<AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>出错了</AlertDialogTitle>
						<AlertDialogDescription>{errorMessage}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>关闭</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DashboardLayout>
	);
}
