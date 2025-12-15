import { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/components/login-form';
import { LogoWithThemeIcon } from '@/app/ui/logo-with-theme-icon';
import { AuthErrorCard } from '../error/page';

export const metadata: Metadata = {
	title: 'ichiyo | 登录',
};

export default async function LoginPage(props: {
	searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
	const searchParams = await props.searchParams;
	const error = searchParams.error;
	const callbackUrl = searchParams.callbackUrl;

	const Content = error ? AuthErrorCard : LoginForm;

	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<LogoWithThemeIcon />

				<Content callbackUrl={callbackUrl} />
			</div>
		</div>
	);
}
