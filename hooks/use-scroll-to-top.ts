'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useScrollToTop() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// 1. 核心修复：检查 URL 中是否有 hash (锚点)
		// 如果存在 hash (例如 #section1)，则不强制滚动到顶部
		if (window.location.hash) {
			return;
		}

		// 禁用浏览器的滚动恢复
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		// 页面切换时强制滚动到顶部
		const scrollToTop = () => {
			window.scrollTo({ top: 0, behavior: 'instant' });
		};

		// 使用 requestAnimationFrame 确保在 DOM 更新后执行
		requestAnimationFrame(() => {
			scrollToTop();
		});

		// 额外延迟执行，确保页面完全加载
		// 注意：如果有锚点，这一步也需要被上面的 if (window.location.hash) 拦截
		const timeoutId = setTimeout(() => {
			scrollToTop();
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [pathname, searchParams]);
}

export default function ScrollToTop() {
	useScrollToTop();
	return null;
}
