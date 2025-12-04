'use client';

import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { CircleX } from 'lucide-react';
import { ImageUrlWithPreview } from '@/app/ui/image-url-with-preview';
import { Checkbox } from '@/components/ui/checkbox';
import { request } from '@/hooks/use-request';
import type { Friend } from '@/types/config';
import { toast } from 'sonner';
import DashboardLayout from '@/app/ui/dashboard-layout';

export default function DashboardConfigFriendNew() {
	const router = useRouter();

	const [name, setName] = useState('');
	const [image, setImage] = useState('');
	const [description, setDescription] = useState('');
	const [pinned, setPinned] = useState(false);

	const [saving, setSaving] = useState(false);
	const [showErrorDialog, setShowErrorDialog] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [socialLinks, setSocialLinks] = useState([
		{ name: '', link: '', iconLight: '', iconDark: '' },
	]);

	function updateSocialLink(
		index: number,
		field: 'name' | 'link' | 'iconLight' | 'iconDark',
		value: string
	) {
		setSocialLinks((prev) => {
			const newLinks = [...prev];
			newLinks[index] = { ...newLinks[index], [field]: value };
			return newLinks;
		});
	}

	function addSocialLink() {
		setSocialLinks((prev) => [
			...prev,
			{ name: '', link: '', iconLight: '', iconDark: '' },
		]);
	}

	function removeSocialLink(index: number) {
		setSocialLinks((prev) => prev.filter((_, i) => i !== index));
	}

	async function handleSave() {
		setSaving(true);
		try {
			const res = await request<Friend>('/api/friend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					name: name.trim(),
					image: image.trim(),
					description: description.trim(),
					pinned,
					socialLinks: socialLinks.map((link) => ({
						name: link.name.trim(),
						link: link.link.trim(),
						iconLight: link.iconLight.trim(),
						iconDark: link.iconDark.trim(),
					})),
				}),
			});
			if (!res) {
				toast.error('保存失败，请重试');
				throw new Error('保存失败，请重试');
			}
			toast.success('保存成功');
			router.push('/dashboard/config/link');
		} catch (error) {
			const msg =
				error instanceof Error ? error.message : '保存失败，请稍后再试';
			setErrorMessage(msg);
			setShowErrorDialog(true);
		} finally {
			setSaving(false);
		}
	}

	return (
		<DashboardLayout
			breadcrumbs={[
				{ label: '仪表盘', href: '/dashboard' },
				{ label: '友链', href: '/dashboard/config/link' },
				{ label: '新建友链', href: '/dashboard/config/link/new' },
			]}
		>
			<h1 className="text-foreground/90 mb-4 text-2xl font-bold">新建友链</h1>

			<div className="space-y-4">
				{/* 名称 */}
				<div>
					<label
						htmlFor="name"
						className="text-foreground/90 mb-1 block font-semibold"
					>
						名称
					</label>
					<Input
						id="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="请输入名称"
					/>
				</div>

				{/* 头像 URL */}
				<ImageUrlWithPreview
					labelName="图标 URL"
					labelClassName="block mb-1 font-semibold text-foreground/90"
					src={image}
					setSrc={setImage}
					loading={false}
				/>

				{/* 社交地址 */}
				<div>
					<label className="text-foreground/90 mb-2 block font-semibold">
						社交地址
					</label>

					{socialLinks.map((link, index) => (
						<div
							key={index}
							className="border-foreground/20 transition-border focus-within:border-foreground/50 relative mb-3 rounded-lg border p-3 shadow-xs duration-200"
						>
							{socialLinks.length > 1 && (
								<button
									type="button"
									onClick={() => removeSocialLink(index)}
									className="absolute top-1 right-1 text-2xl leading-none font-bold text-red-500 hover:text-red-700"
									aria-label="删除社交地址"
								>
									<CircleX />
								</button>
							)}
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
								<div>
									<label className="text-foreground/90 mb-1 block text-sm font-medium">
										社交平台名称
									</label>
									<Input
										value={link.name}
										onChange={(e) =>
											updateSocialLink(index, 'name', e.target.value)
										}
										placeholder="例如微博"
									/>
								</div>
								<div>
									<label className="text-foreground/90 mb-1 block text-sm font-medium">
										链接 URL
									</label>
									<Input
										value={link.link}
										onChange={(e) =>
											updateSocialLink(index, 'link', e.target.value)
										}
										placeholder="https://example.com"
									/>
								</div>
								<div>
									<label className="text-foreground/90 mb-1 block text-sm font-medium">
										浅色 Icon URL
									</label>
									<Input
										value={link.iconLight}
										onChange={(e) =>
											updateSocialLink(index, 'iconLight', e.target.value)
										}
										placeholder="浅色图标链接"
									/>
								</div>
								<div>
									<label className="text-foreground/90 mb-1 block text-sm font-medium">
										深色 Icon URL
									</label>
									<Input
										value={link.iconDark}
										onChange={(e) =>
											updateSocialLink(index, 'iconDark', e.target.value)
										}
										placeholder="深色图标链接"
									/>
								</div>
							</div>
						</div>
					))}

					<Button
						type="button"
						variant="outline"
						onClick={addSocialLink}
						size="sm"
					>
						+ 添加社交地址
					</Button>
				</div>

				{/* 介绍 */}
				<div>
					<label
						htmlFor="description"
						className="text-foreground/90 mb-1 block font-semibold"
					>
						介绍
					</label>
					<Textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="请输入介绍"
						className="text-foreground/90 dark:bg-muted/50 bg-white"
					/>
				</div>

				{/* 置顶 */}
				<div className="flex items-center space-x-2">
					<Checkbox
						id="pinned"
						checked={pinned}
						onCheckedChange={(checked) => setPinned(!!checked)}
					/>
					<label
						htmlFor="pinned"
						className="text-foreground/90 cursor-pointer select-none"
					>
						置顶
					</label>
				</div>

				{/* 操作按钮 */}
				<div className="flex justify-start gap-2">
					<Button onClick={handleSave} disabled={saving}>
						{saving ? '保存中...' : '保存'}
					</Button>
					<Button
						variant="outline"
						onClick={() => router.push('/dashboard/config/link')}
						disabled={saving}
					>
						取消
					</Button>
				</div>
			</div>

			<AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>保存失败</AlertDialogTitle>
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
