'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function FaviconSwitcher() {
	const { resolvedTheme } = useTheme();
	const [faviconHref, setFaviconHref] = useState('/logo_light.svg');

	useEffect(() => {
		if (resolvedTheme === 'dark') {
			setFaviconHref('/logo_dark.svg');
		} else {
			setFaviconHref('/logo_light.svg');
		}
	}, [resolvedTheme]);

	return (
		<>
			<link key="favicon" rel="icon" href={faviconHref} type="image/svg+xml" />
		</>
	);
}
