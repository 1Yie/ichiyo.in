'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ScrollToTopButton() {
	const [isVisible, setIsVisible] = useState(false);
	const [isClicked, setIsClicked] = useState(false);
	const isMobile = useIsMobile();

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const toggleVisibility = () => {
			if (window.pageYOffset > 300) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
				setIsClicked(false);
			}
		};

		toggleVisibility();
		window.addEventListener('scroll', toggleVisibility);
		return () => window.removeEventListener('scroll', toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};

	const handleClick = () => {
		if (isMobile) {
			// 移动端：设置为点击状态(变方+居中) -> 延迟滚动 -> 延迟重置
			setIsClicked(true);
			setTimeout(() => {
				scrollToTop();
				setTimeout(() => setIsClicked(false), 800);
			}, 400);
		} else {
			// PC端：直接滚动
			scrollToTop();
		}
	};

	// 定义路径字符串 (避免拼写错误)
	// 三角形路径 (顶点下沉 13.4%)
	const trianglePath =
		'[clip-path:polygon(50%_13.4%,0_100%,100%_100%,50%_13.4%)]';
	// 正方形路径
	const squarePath = '[clip-path:polygon(0_0,0_100%,100%_100%,100%_0)]';

	return (
		<div
			className={`group fixed right-8 bottom-8 z-50 flex items-center justify-center drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out ${isVisible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'} `}
		>
			<Button
				onClick={handleClick}
				className={`bg-primary text-primary-foreground hover:bg-primary /* --- 形状逻辑 (修复点) --- */ /* 如果被点击 (移动端): 强制显示正方形 */ /* 如果没被点击: 默认显示三角形，hover 时变正方形 */ h-12 w-12 rounded-none p-0 transition-all duration-500 ease-in-out ${isClicked ? squarePath : `${trianglePath} group-hover:${squarePath}`} `}
				size="icon"
				aria-label="回到顶部"
			>
				<ArrowUp
					className={`/* --- 箭头位置逻辑 (修复点) --- */ /* 如果被点击 (移动端): 强制居中 (!translate-y-0) */ /* 如果没被点击: 默认下沉 (translate-y-2.5)，hover 时居中 */ h-6 w-6 transition-transform duration-500 ease-in-out ${isClicked ? '!translate-y-0' : 'translate-y-2.5 group-hover:translate-y-0'} `}
				/>
			</Button>
		</div>
	);
}
