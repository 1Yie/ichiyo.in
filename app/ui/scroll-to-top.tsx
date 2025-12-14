import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useScrollToTop() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		// 禁用浏览器自动滚动恢复
		if ('scrollRestoration' in history) {
			history.scrollRestoration = 'manual';
		}

		const handleScroll = () => {
			const hash = window.location.hash;

			// 情况 A: 有锚点 (例如 /page#footer)
			if (hash) {
				// 尝试找到 ID 对应的元素
				// 这里的 decodeURIComponent 是为了处理中文 ID
				const id = decodeURIComponent(hash.substring(1));
				const element = document.getElementById(id);

				if (element) {
					element.scrollIntoView();
				}
				// 如果没找到元素（有时 React 渲染慢），可能需要重试逻辑，
				// 但通常直接 return 不执行 scrollTo(0,0) 就足够让浏览器后续处理了
				return;
			}

			// 情况 B: 普通页面切换，没有锚点 -> 滚到顶部
			window.scrollTo({ top: 0, behavior: 'instant' });
		};

		// 使用 requestAnimationFrame 确保在 DOM 更新后执行
		requestAnimationFrame(() => {
			handleScroll();
		});

		// 延迟兜底
		const timeoutId = setTimeout(() => {
			handleScroll();
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [pathname, searchParams]);
}

export default function ScrollToTop() {
	useScrollToTop();
	return null;
}
