'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SecretInput } from '@/components/ui/secret-input';
import Link from 'next/link';

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const [id, setId] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [registerKey, setRegisterKey] = useState('');
	const [loading, setLoading] = useState(false);

	const [errorDialogOpen, setErrorDialogOpen] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const [successDialogOpen, setSuccessDialogOpen] = useState(false);
	const [successRegister, setSuccessRegister] = useState(false);

	const router = useRouter();

	const errorMessages: Record<string, string> = {
		MISSING_FIELDS: '请填写所有字段',
		INVALID_REGISTER_KEY: '注册密钥错误',
		USER_EXISTS: '名称或邮箱已被注册',
		INTERNAL_ERROR: '服务器错误，请稍后重试',
		DEFAULT: '注册失败，请重试',
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setErrorMsg('两次输入的密码不一致');
			setErrorDialogOpen(true);
			return;
		}

		if (!id.trim()) {
			setErrorMsg('请输入名称');
			setErrorDialogOpen(true);
			return;
		}

		setLoading(true);

		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, email, password, registerKey }),
			});

			const data = await res.json();

			if (res.ok) {
				setSuccessRegister(true);
				setSuccessDialogOpen(true);
			} else {
				const message =
					errorMessages[data.code as keyof typeof errorMessages] ||
					data.message ||
					errorMessages.DEFAULT;
				setErrorMsg(message);
				setErrorDialogOpen(true);
			}
		} catch (err) {
			setSuccessRegister(false);
			console.error('请求错误:', err);
			setErrorMsg('请求失败，请检查网络');
			setErrorDialogOpen(true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className={cn('flex flex-col gap-6', className)} {...props}>
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">注册</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleRegister}>
							<div className="grid gap-6">
								<div className="grid gap-3">
									<Label htmlFor="id">名称</Label>
									<Input
										id="id"
										type="text"
										required
										value={id}
										onChange={(e) => setId(e.target.value)}
										placeholder="请输入名称"
									/>
								</div>
								<div className="grid gap-3">
									<Label htmlFor="email">邮箱</Label>
									<Input
										id="email"
										type="email"
										required
										placeholder="请输入邮箱"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
								<div className="grid gap-3">
									<Label htmlFor="password">密码</Label>
									<Input
										id="password"
										type="password"
										required
										placeholder="请输入密码"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										autoComplete="new-password"
									/>
								</div>
								<div className="grid gap-3">
									<Label htmlFor="confirmPassword">确认密码</Label>
									<Input
										id="confirmPassword"
										type="password"
										placeholder="请确认密码"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										autoComplete="new-password"
									/>
								</div>
								<div className="grid gap-3">
									<Label htmlFor="registerKey">注册密钥</Label>
									<SecretInput
										id="registerKey"
										required
										placeholder="请输入注册密钥"
										value={registerKey}
										onChange={(e) => setRegisterKey(e.target.value)}
									/>
								</div>
								<Button
									type="submit"
									className="flex w-full items-center justify-center gap-2"
									disabled={loading}
								>
									{loading && <Loader2 className="h-4 w-4 animate-spin" />}
									<span>
										{loading ? '注册中' : successRegister ? '注册成功' : '注册'}
									</span>
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
				<div className="flex flex-col items-center gap-1.5">
					<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-sm text-balance *:[a]:underline *:[a]:underline-offset-4">
						已有账号？ <Link href="/login">点此登录</Link>
					</div>
				</div>
			</div>

			<AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>注册成功</AlertDialogTitle>
						<AlertDialogDescription>
							您已成功注册，请前往登录。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							onClick={() => {
								setSuccessDialogOpen(false);
								router.push('/login');
							}}
							className="w-full"
						>
							前往登录
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>注册失败</AlertDialogTitle>
						<AlertDialogDescription>{errorMsg}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setErrorDialogOpen(false)}>
							关闭
						</AlertDialogCancel>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
