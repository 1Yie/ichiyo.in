'use client';

import { useMemo } from 'react';
import { useTheme } from 'next-themes';

export default function FaviconSwitcher() {
	const { resolvedTheme } = useTheme();

	// 避免在 effect 中同步 setState，直接根据 theme 派生 favicon 地址
	const faviconHref = useMemo(() => {
		return resolvedTheme === 'dark' ? '/logo_dark.svg' : '/logo_light.svg';
	}, [resolvedTheme]);

	return (
		<link key="favicon" rel="icon" href={faviconHref} type="image/svg+xml" />
	);
}
