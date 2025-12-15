'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Loader2, Github } from 'lucide-react';

export function LoginForm({
	className,
	...props
}: React.ComponentProps<'div'> & { callbackUrl?: string }) {
	const [loading, setLoading] = useState(false);
	const { callbackUrl } = props;

	const handleGithubLogin = async () => {
		setLoading(true);
		try {
			await signIn('github', { callbackUrl });
		} catch (error) {
			console.error('Login failed:', error);
			setLoading(false);
		}
	};

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">登录</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6">
						<Button
							variant="default"
							className="w-full text-base"
							onClick={handleGithubLogin}
							disabled={loading}
						>
							{loading ? (
								<Loader2 className="mr-2 h-6 w-6 animate-spin" />
							) : (
								<Github className="mr-2 h-6 w-6" />
							)}
							GitHub 登录
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
