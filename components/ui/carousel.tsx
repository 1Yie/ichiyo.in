'use client';
import Image from 'next/image';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { useState, useRef, useId, useEffect } from 'react';

interface SlideData {
	title: string;
	button?: string;
	src: string;
	link?: string;
	newTab?: boolean;
}

interface SlideProps {
	slide: SlideData;
	index: number;
	current: number;
	handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
	const slideRef = useRef<HTMLLIElement>(null);
	const xRef = useRef(0);
	const yRef = useRef(0);
	const frameRef = useRef<number>(0);
	const [isTouching, setIsTouching] = useState(false);
	const [contentVisible, setContentVisible] = useState(current === index);

	useEffect(() => {
		const animate = () => {
			if (!slideRef.current) return;

			const x = xRef.current;
			const y = yRef.current;

			slideRef.current.style.setProperty('--x', `${x}px`);
			slideRef.current.style.setProperty('--y', `${y}px`);

			frameRef.current = requestAnimationFrame(animate);
		};

		frameRef.current = requestAnimationFrame(animate);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, []);

	// 优化内容显示与隐藏的时机控制
	useEffect(() => {
		if (current === index) {
			// 当前幻灯片，立即显示内容
			setContentVisible(true);
		} else {
			// 非当前幻灯片，延迟隐藏内容以配合淡出动画
			const timer = setTimeout(() => {
				setContentVisible(false);
			}, 600); // 与transition时长保持一致
			return () => clearTimeout(timer);
		}
	}, [current, index]);

	const handleMouseMove = (event: React.MouseEvent) => {
		if (isTouching) return; // 触摸时忽略鼠标事件，避免冲突
		const el = slideRef.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		xRef.current = event.clientX - (r.left + r.width / 2);
		yRef.current = event.clientY - (r.top + r.height / 2);
	};

	const handleMouseLeave = () => {
		if (isTouching) return;
		xRef.current = 0;
		yRef.current = 0;
	};

	const handleTouchMove = (event: React.TouchEvent) => {
		setIsTouching(true);
		const el = slideRef.current;
		if (!el) return;
		const r = el.getBoundingClientRect();
		const touch = event.touches[0];
		xRef.current = touch.clientX - (r.left + r.width / 2);
		yRef.current = touch.clientY - (r.top + r.height / 2);
	};

	const handleTouchEnd = () => {
		setIsTouching(false);
		xRef.current = 0;
		yRef.current = 0;
	};

	const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
		event.currentTarget.style.opacity = '1';
	};

	const handleContentClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (slide.link) {
			if (slide.newTab) {
				window.open(slide.link, '_blank');
			} else {
				window.location.href = slide.link;
			}
		}
	};

	const { src, button, title } = slide;

	return (
		<div className="[perspective:1200px] [transform-style:preserve-3d]">
			<li
				ref={slideRef}
				className="relative z-10 mx-[4vmin] flex h-[70vmin] w-[70vmin] flex-1 flex-col items-center justify-center text-center text-white opacity-100 transition-all duration-300 ease-in-out"
				onClick={() => handleSlideClick(index)}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				style={{
					transform: current !== index ? 'scale(0.9)' : 'scale(1)',
					transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
					transformOrigin: 'bottom',
				}}
			>
				<div
					className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-[1%] bg-[#1D1F2F] transition-all duration-150 ease-out"
					style={{
						transform:
							current === index
								? 'translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)'
								: 'none',
						boxShadow:
							current === index
								? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 5px 10px -3px rgba(0, 0, 0, 0.15)'
								: 'none',
						transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
					}}
				>
					<Image
						className="absolute inset-0 h-[120%] w-[120%] object-cover opacity-100 transition-opacity duration-600 ease-in-out"
						style={{
							opacity: current === index ? 1 : 0.5,
							transform: current === index ? 'scale(1.05)' : 'none',
							transition: 'opacity 0.6s ease-in-out, transform 0.3s ease-out',
						}}
						alt={title}
						src={src}
						onLoad={imageLoaded}
						loading="eager"
						decoding="async"
						unoptimized
						fill
					/>
					<div
						className={`absolute inset-0 ${
							current === index ? 'bg-black/30' : 'bg-transparent'
						} transition-all duration-1000`}
					/>
				</div>

				{/* 始终渲染内容，通过CSS控制可见性和交互性 */}
				<article
					className={`relative z-50 p-[4vmin] transition-all duration-600 ease-in-out ${
						current === index
							? 'pointer-events-auto translate-y-0 transform opacity-100'
							: 'pointer-events-none translate-y-2 transform opacity-0'
					}`}
					style={{
						// 确保内容在DOM中始终存在，避免闪现
						visibility: contentVisible ? 'visible' : 'hidden',
					}}
				>
					<h2 className="relative text-lg font-semibold md:text-2xl lg:text-4xl">
						{title}
					</h2>
					{button && (
						<div className="flex justify-center">
							<button
								className="mx-auto mt-6 flex h-12 w-fit cursor-pointer items-center justify-center rounded-2xl border border-transparent bg-white px-4 py-2 text-xs text-black shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200 select-none hover:bg-gray-200 hover:shadow-lg sm:text-sm"
								onClick={handleContentClick}
							>
								{button}
							</button>
						</div>
					)}
				</article>
			</li>
		</div>
	);
};

interface CarouselControlProps {
	type: string;
	title?: string;
	handleClick: () => void;
}

const CarouselControl = ({
	type,
	title,
	handleClick,
}: CarouselControlProps) => {
	return (
		<button
			className={`mx-2 flex h-10 w-18 cursor-pointer items-center justify-center rounded-full border-3 border-transparent bg-neutral-200 transition duration-200 hover:-translate-y-0.5 focus:border-[var(--foreground)] focus:outline-none active:translate-y-0.5 dark:bg-neutral-800 ${
				type === 'previous' ? 'rotate-180' : ''
			}`}
			title={title}
			onClick={handleClick}
		>
			<IconArrowNarrowRight className="text-neutral-600 dark:text-neutral-200" />
		</button>
	);
};

interface CarouselProps {
	slides: SlideData[];
}

export function Carousel({ slides }: CarouselProps) {
	const [current, setCurrent] = useState(0);
	const id = useId();

	const handlePreviousClick = () => {
		const previous = current - 1;
		setCurrent(previous < 0 ? slides.length - 1 : previous);
	};

	const handleNextClick = () => {
		const next = current + 1;
		setCurrent(next === slides.length ? 0 : next);
	};

	const handleSlideClick = (index: number) => {
		if (current !== index) {
			setCurrent(index);
		}
	};

	return (
		<div
			className="relative mx-auto h-[70vmin] w-[70vmin]"
			aria-labelledby={`carousel-heading-${id}`}
		>
			<ul
				className="absolute mx-[-4vmin] flex transition-transform duration-1000 ease-in-out"
				style={{
					transform: `translateX(-${current * (100 / slides.length)}%)`,
				}}
			>
				{slides.map((slide, index) => (
					<Slide
						key={index}
						slide={slide}
						index={index}
						current={current}
						handleSlideClick={handleSlideClick}
					/>
				))}
			</ul>

			<div className="absolute top-[calc(100%+1rem)] flex w-full justify-center">
				<CarouselControl type="previous" handleClick={handlePreviousClick} />
				<CarouselControl type="next" handleClick={handleNextClick} />
			</div>
		</div>
	);
}
