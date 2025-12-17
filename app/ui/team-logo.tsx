'use client';

import Image from 'next/image';

interface TeamLogoProps {
	lightSrc: string;
	darkSrc: string;
	alt?: string;
	width?: number;
	height?: number;
	className?: string;
}

export function TeamLogo({
	lightSrc,
	darkSrc,
	alt = 'logo',
	width = 24,
	height = 24,
	className,
}: TeamLogoProps) {
	return (
		<>
			<Image
				src={lightSrc}
				alt={alt}
				width={width}
				height={height}
				className={`${className} dark:hidden`}
				unoptimized
				priority
			/>
			<Image
				src={darkSrc}
				alt={alt}
				width={width}
				height={height}
				className={`${className} hidden dark:block`}
				unoptimized
				priority
			/>
		</>
	);
}
