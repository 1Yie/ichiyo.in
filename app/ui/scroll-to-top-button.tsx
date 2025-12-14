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
				// 核心逻辑：
				// 当页面回到顶部（按钮消失）时，自动把“方块锁定状态”解除。
				// 这样下次按钮出现时，又会恢复成默认的三角形。
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
		// 1. 核心修改：无论 PC 还是移动端，点击瞬间都锁定为“方块”
		// 这样在滚动过程中，它会一直保持方块形状，直到滚到顶部消失
		setIsClicked(true);

		if (isMobile) {
			// 移动端：保留延迟，为了展示变身动画
			setTimeout(() => {
				scrollToTop();
			}, 400);
		} else {
			// PC 端：立即滚动
			// 此时 isClicked 已经是 true，所以按钮会以“方块”姿态向上滚动
			scrollToTop();
		}
	};

	return (
		<div
			className={`group fixed right-8 bottom-8 z-50 flex items-center justify-center drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-500 ease-in-out ${isVisible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'} `}
		>
			<Button
				onClick={handleClick}
				className={`bg-primary text-primary-foreground hover:bg-primary /* --- 形状逻辑 --- */ h-12 w-12 rounded-none p-0 transition-all duration-500 ease-in-out ${
					isClicked
						? '[clip-path:polygon(0_0,0_100%,100%_100%,100%_0)]' // 点击锁定状态：全程保持正方形
						: '[clip-path:polygon(50%_13.4%,0_100%,100%_100%,50%_13.4%)] group-hover:[clip-path:polygon(0_0,0_100%,100%_100%,100%_0)] hover:[clip-path:polygon(0_0,0_100%,100%_100%,100%_0)]'
					// 默认状态：三角 -> 悬浮变正方
				} `}
				size="icon"
				aria-label="回到顶部"
			>
				<ArrowUp
					className={`/* --- 图标位置逻辑 --- */ h-6 w-6 transition-transform duration-500 ease-in-out ${
						isClicked
							? '!translate-y-0' // 点击锁定状态：强制居中
							: 'translate-y-2.5 group-hover:translate-y-0 hover:translate-y-0' // 默认状态：下沉 -> 悬浮居中
					} `}
				/>
			</Button>
		</div>
	);
}
