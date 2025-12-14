'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScrollToTopButton() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const toggleVisibility = () => {
			if (window.pageYOffset > 300) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
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

	return (
		<div
			className={`group fixed right-8 bottom-8 z-50 flex items-center justify-center drop-shadow-xl transition-all duration-500 ease-in-out ${isVisible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'} `}
		>
			<Button
				onClick={scrollToTop}
				className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12 rounded-none p-0 transition-all duration-500 ease-in-out [clip-path:polygon(50%_13.4%,0_100%,100%_100%,50%_13.4%)] group-hover:[clip-path:polygon(0_0,0_100%,100%_100%,100%_0)]"
				size="icon"
				aria-label="回到顶部"
			>
				<ArrowUp className="h-6 w-6 translate-y-2.5 transition-transform duration-500 ease-in-out group-hover:translate-y-0" />
			</Button>
		</div>
	);
}
