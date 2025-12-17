'use client';
import React, { useSyncExternalStore } from 'react';
import { useThemeSwitcher } from '@/lib/use-theme-switcher';
import { useSiteUpdateToast } from '@/hooks/use-site-update';

const emptySubscribe = () => () => {};

const ClientThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const isMounted = useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false
	);

	useThemeSwitcher();
	useSiteUpdateToast();

	if (!isMounted) return null;

	return <>{children}</>;
};

export default ClientThemeProvider;
