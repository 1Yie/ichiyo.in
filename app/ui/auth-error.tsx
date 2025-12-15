'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Ban,
	AlertTriangle,
	ArrowLeft,
	WifiOff,
	FileWarning,
	Settings2,
} from 'lucide-react';

interface ErrorConfig {
	message: string;
	icon: React.ElementType;
	iconColor: string;
}

const ERROR_CONFIG: Record<string, ErrorConfig> = {
	AccessDenied: {
		message: '当前用户无权限访问',
		icon: Ban,
		iconColor: 'text-red-500',
	},

	Verification: {
		message: '验证链接已失效或无效',
		icon: FileWarning,
		iconColor: 'text-orange-500',
	},

	Configuration: {
		message: '系统配置错误，请联系管理员',
		icon: Settings2,
		iconColor: 'text-muted-foreground',
	},

	OAuthCallback: {
		message: '取消了授权，或连接中断',
		icon: WifiOff,
		iconColor: 'text-orange-600',
	},
	OAuthCallbackError: {
		message: '取消了授权，或连接中断',
		icon: WifiOff,
		iconColor: 'text-orange-600',
	},

	Default: {
		message: '登录发生未知错误',
		icon: AlertTriangle,
		iconColor: 'text-yellow-600',
	},
};

export function AuthError({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const searchParams = useSearchParams();
	const errorKey = searchParams.get('error');

	const {
		message,
		icon: Icon,
		iconColor,
	} = errorKey && ERROR_CONFIG[errorKey]
		? ERROR_CONFIG[errorKey]
		: ERROR_CONFIG.Default;

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="flex items-center justify-center gap-2 text-xl">
						<Icon className={cn('h-6 w-6', iconColor)} />
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6">
						<div className="text-muted-foreground bg-secondary/30 border-border/50 rounded-md border p-3 text-center text-sm">
							{message}
						</div>

						<Button variant="default" className="w-full text-base" asChild>
							<Link href="/auth/login">
								<ArrowLeft className="mr-2 h-5 w-5" />
								返回登录
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
