'use client';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function LogoWithThemeIcon() {
	const { theme, systemTheme } = useTheme();

	const isMounted = useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false
	);

	if (!isMounted) return null;

	const currentTheme = theme === 'system' ? systemTheme : theme;

	const logoSrc =
		currentTheme === 'dark' ? '/logo_light.svg' : '/logo_dark.svg';

	return (
		<Link href="/" className="flex items-center gap-2 self-center font-medium">
			<div className="bg-accent-foreground text-accent-foreground flex size-6 items-center justify-center rounded-md p-0.5">
				<Image src={logoSrc} alt="logo" width={24} height={24} />
			</div>
			ichiyo.in
		</Link>
	);
}
