import { useTheme } from 'next-themes';

export function useThemeSwitcher() {
	const { setTheme } = useTheme();

	function setAppTheme(theme: 'system' | 'dark' | 'light') {
		if (['system', 'dark', 'light'].includes(theme)) {
			setTheme(theme);
		} else {
			console.warn(`Invalid theme value: ${theme}`);
		}
	}

	return { setAppTheme };
}
