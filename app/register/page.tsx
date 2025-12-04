import { Metadata } from 'next';

import { RegisterForm } from '@/components/register-form';

import { LogoWithThemeIcon } from '@/app/ui/logo-with-theme-icon';

export const metadata: Metadata = {
	title: 'ichiyo | 注册',
};

export default function RegisterPage() {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<LogoWithThemeIcon />
				<RegisterForm />
			</div>
		</div>
	);
}
