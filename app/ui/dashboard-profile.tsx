'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Ban, IdCard, Mail, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import DashboardLayout from '@/ui/dashboard-layout';
import { useUser, useAdminCheck } from '@/contexts/user-context';
import ms from 'ms';

export default function DashboardProfile() {
	const { userInfo, logout, refreshUser, isAuthenticated } = useUser();
	const { isAdmin, isSuperAdmin } = useAdminCheck();

	// 编辑用户名相关状态
	const [formName, setFormName] = useState(userInfo?.name || '');
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [isSubmittingName, setIsSubmittingName] = useState(false);

	// 管理员设置弹窗状态
	const [showAdminDialog, setShowAdminDialog] = useState(false);

	// 注册密钥相关状态
	const [showKeyDialog, setShowKeyDialog] = useState(false);
	const [registerKey, setRegisterKey] = useState<{
		id: number;
		value: string;
		expiresAt: number;
		isNew: boolean;
	}>({
		id: 0,
		value: '',
		expiresAt: 0,
		isNew: false,
	});

	// 密钥加载状态
	const [loadingKey, setLoadingKey] = useState(false);
	const [remainingTime, setRemainingTime] = useState<string>('');

	// 初始化API开关状态
	const [initApiEnabled, setInitApiEnabled] = useState(true);
	const [loadingInitSetting, setLoadingInitSetting] = useState(false);

	// 所有用户列表
	const [allUsers, setAllUsers] = useState<
		{ uid: string; email: string; isAdmin: boolean; isSuperAdmin: boolean }[]
	>([]);
	const [usersLoaded, setUsersLoaded] = useState(false);
	const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);

	// 保存原始用户权限状态，用于检测变化
	const [originalUserPermission, setOriginalUserPermission] = useState<
		boolean | null
	>(null);

	// 密钥过期时间倒计时
	useEffect(() => {
		if (!showKeyDialog || !registerKey.expiresAt) return;

		const updateRemainingTime = () => {
			const now = Date.now();
			const diff = registerKey.expiresAt - now;

			if (diff <= 0) {
				setRemainingTime('已过期');
				return;
			}

			const minutes = Math.floor(diff / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);
			setRemainingTime(`${minutes}分${seconds.toString().padStart(2, '0')}秒`);
		};

		updateRemainingTime();
		const timer = setInterval(updateRemainingTime, 1000);

		return () => clearInterval(timer);
	}, [showKeyDialog, registerKey.expiresAt]);

	// 同步 userInfo 到本地编辑状态
	useEffect(() => {
		if (userInfo?.name) setFormName(userInfo.name);
	}, [userInfo]);

	// 关闭编辑用户名弹窗时重置状态
	useEffect(() => {
		if (!showEditDialog) {
			setFormName(userInfo?.name || '');
			setIsSubmittingName(false);
		}
	}, [showEditDialog, userInfo]);

	// 加载所有用户列表
	useEffect(() => {
		const loadUserData = async () => {
			if (usersLoaded) return;

			try {
				const res = await fetch('/api/users', { credentials: 'include' });
				if (!res.ok) throw new Error('加载用户列表失败');
				const data = await res.json();
				setAllUsers(data.users || []);
				setUsersLoaded(true);
			} catch (error) {
				toast.error('加载用户数据失败');
				console.error(error);
			}
		};

		loadUserData();
	}, [usersLoaded]);

	// 加载初始化API开关状态
	useEffect(() => {
		const loadInitSetting = async () => {
			if (!isSuperAdmin) return;

			try {
				const res = await fetch('/api/settings/init', {
					credentials: 'include',
				});
				if (res.ok) {
					const data = await res.json();
					setInitApiEnabled(data.enabled);
				}
			} catch (error) {
				console.error('加载初始化设置失败:', error);
			}
		};

		loadInitSetting();
	}, [isSuperAdmin]);

	// 编辑用户名提交
	const handleSubmitName = async () => {
		if (!formName.trim()) {
			toast.error('用户名不能为空');
			return;
		}

		if (formName.trim() === userInfo?.name) {
			return;
		}

		setIsSubmittingName(true);
		try {
			const res = await fetch('/api/me', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ id: formName.trim() }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || '修改用户名失败');
			}

			// 先关闭对话框
			setShowEditDialog(false);

			// 然后刷新用户数据
			await refreshUser();

			toast.success('用户名修改成功');
		} catch (error) {
			toast.error(
				'修改用户名失败: ' + (error instanceof Error ? error.message : '')
			);
		} finally {
			setIsSubmittingName(false);
		}
	};

	// 获取密钥有效期配置
	const getKeyTTLDisplay = () => {
		const keyTTL = process.env.NEXT_PUBLIC_KEY_TTL_MS as ms.StringValue;
		try {
			const milliseconds = ms(keyTTL);
			if (typeof milliseconds !== 'number') return '未知';

			const minutes = Math.floor(milliseconds / 60000);
			const seconds = Math.floor((milliseconds % 60000) / 1000);

			if (minutes > 0 && seconds > 0) {
				return `${minutes} 分钟 ${seconds} 秒`;
			} else if (minutes > 0) {
				return `${minutes} 分钟`;
			} else {
				return `${seconds} 秒`;
			}
		} catch {
			return '未知';
		}
	};

	// 保存用户权限
	async function handleSaveUserPermission() {
		if (!selectedUserUid) {
			toast.error('请选择用户');
			return;
		}

		const user = allUsers.find((u) => u.uid === selectedUserUid);
		if (!user) return;

		try {
			const res = await fetch('/api/users/admin', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					email: user.email,
					isAdmin: user.isAdmin,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || '修改失败');
			}

			const data = await res.json();
			toast.success(data.message);
			setShowAdminDialog(false);

			setSelectedUserUid(null);
			setOriginalUserPermission(null);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : '修改失败');
		}
	}

	// 检查密钥状态
	const checkKeyStatus = async () => {
		try {
			const res = await fetch('/api/register/key/status', {
				method: 'GET',
				credentials: 'include',
			});

			if (!res.ok) {
				throw new Error('检查密钥状态失败');
			}

			const data = await res.json();
			return data;
		} catch (error) {
			console.error('检查密钥状态失败:', error);
			return null;
		}
	};

	// 生成注册密钥
	const handleGenerateKey = async () => {
		setLoadingKey(true);
		try {
			// 首先检查当前密钥状态
			const statusData = await checkKeyStatus();

			if (statusData && statusData.exists && statusData.isValid) {
				// 如果存在有效密钥，直接显示
				setRegisterKey({
					id: statusData.id,
					value: statusData.key,
					expiresAt: parseInt(statusData.expiresAt),
					isNew: false,
				});
				setShowKeyDialog(true);
				toast.info('当前密钥仍有效');
				return;
			}

			// 如果没有有效密钥，生成新密钥
			const res = await fetch('/api/register/key', {
				method: 'GET',
				credentials: 'include',
			});

			if (!res.ok) {
				throw new Error('生成密钥失败');
			}

			const data = await res.json();
			if (!data.key || !data.expiresAt || !data.id) {
				throw new Error('无效的密钥响应');
			}

			setRegisterKey({
				id: data.id,
				value: data.key,
				expiresAt: parseInt(data.expiresAt),
				isNew: true,
			});

			setShowKeyDialog(true);
			toast.success('新注册密钥已生成');
		} catch (error) {
			toast.error(
				'生成密钥失败: ' + (error instanceof Error ? error.message : '')
			);
		} finally {
			setLoadingKey(false);
		}
	};

	// 切换初始化API开关
	const handleToggleInitApi = async (enabled: boolean) => {
		setLoadingInitSetting(true);
		try {
			const res = await fetch('/api/settings/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ enabled }),
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || '更新设置失败');
			}

			setInitApiEnabled(enabled);
			toast.success(`初始化 API 已${enabled ? '启用' : '禁用'}`);
		} catch (error) {
			toast.error(
				'更新设置失败: ' + (error instanceof Error ? error.message : '')
			);
		} finally {
			setLoadingInitSetting(false);
		}
	};

	if (isAuthenticated === undefined || userInfo === undefined) {
		return null;
	}

	if (!isAuthenticated || !userInfo) {
		return (
			<DashboardLayout
				breadcrumbs={[
					{ label: '仪表盘', href: '/dashboard' },
					{ label: '设置', href: '/dashboard/profile' },
				]}
			>
				<div className="bg-diagonal-stripes flex-1 rounded-xl p-4">
					<div className="flex h-full w-full items-center justify-center rounded-xl">
						<div className="flex flex-col items-center justify-center gap-2">
							<Ban className="text-foreground/90 h-18 w-18" />
							<h1 className="text-foreground/90 text-lg">登录状态失效</h1>
							<p className="text-foreground/90 text-sm">请重新登录。</p>
						</div>
					</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout
			breadcrumbs={[
				{ label: '仪表盘', href: '/dashboard' },
				{ label: '设置', href: '/dashboard/profile' },
			]}
		>
			{/* 个人信息 */}
			<h1 className="text-foreground/90 mb-4 text-2xl font-bold">个人信息</h1>
			<div className="bg-muted/50 flex items-center justify-between rounded-2xl p-3">
				<div className="flex items-center gap-4">
					<Image
						src={userInfo.avatar || '/avatar-placeholder.png'} // 适配 next-auth image 字段
						alt="头像"
						className="border-foreground/20 h-12 w-12 shrink-0 rounded-full border"
						width={48}
						height={48}
						priority
						quality={100}
						unoptimized
					/>
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<IdCard className="text-foreground/90 h-4 w-4" />
							<p className="text-foreground text-base">{userInfo.name}</p>
						</div>
						<div className="flex items-center gap-2">
							<Mail className="text-foreground/90 h-4 w-4" />
							<p className="text-foreground text-base">{userInfo.email}</p>
						</div>
					</div>
				</div>
				<Button onClick={() => setShowEditDialog(true)}>编辑信息</Button>
			</div>

			{/* 编辑用户名弹窗 */}
			<AlertDialog open={showEditDialog} onOpenChange={setShowEditDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>修改用户名</AlertDialogTitle>
						<AlertDialogDescription>
							设置一个唯一的用户名 (ID)。
						</AlertDialogDescription>
					</AlertDialogHeader>

					<div className="mt-4 space-y-4">
						<div>
							<Label className="text-foreground/90 mb-2 block text-sm font-medium">
								用户名
							</Label>
							<Input
								value={formName}
								onChange={(e) => setFormName(e.target.value)}
								placeholder="请输入新用户名"
							/>
							{/* <p className="text-muted-foreground mt-1 text-xs">
								当前邮箱: {userInfo.email} (OAuth 登录不可修改)
							</p> */}
						</div>
					</div>

					<AlertDialogFooter className="mt-6">
						<AlertDialogCancel>关闭</AlertDialogCancel>
						<Button
							disabled={
								formName.trim() === (userInfo?.name || '') ||
								!formName.trim() ||
								isSubmittingName
							}
							onClick={async (e) => {
								e.preventDefault();
								await handleSubmitName();
							}}
						>
							{isSubmittingName && <Loader2 className="h-4 w-4 animate-spin" />}
							{isSubmittingName ? '保存中' : '保存'}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DashboardLayout>
	);
}
