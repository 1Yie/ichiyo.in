'use client';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export function ImageUrlWithPreview({
	labelName,
	labelClassName,
	src,
	setSrc,
	loading = false,
}: {
	src: string;
	setSrc: (val: string) => void;
	labelName: string;
	labelClassName: string;
	loading?: boolean;
}) {
	const [preview, setPreview] = useState(src);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);

	const hasPreview = preview.trim() !== '';

	useEffect(() => {
		const timer: NodeJS.Timeout = setTimeout(() => {
			setPreview(src);
			setImageLoaded(false);
			setHasError(false);
		}, 300);

		return () => clearTimeout(timer);
	}, [src]);

	return (
		<div className="flex items-start gap-4">
			{/* 输入框区域 */}
			<div className="flex-1 space-y-2">
				{loading ? (
					<>
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-10 w-full" />
					</>
				) : (
					<>
						<label htmlFor="src" className={labelClassName}>
							{labelName}
						</label>
						<Input
							id="src"
							value={src}
							onChange={(e) => setSrc(e.target.value)}
							placeholder="https://example.com/image.png"
						/>
					</>
				)}
			</div>

			{/* 图片预览区域 */}
			<div className="bg-muted border-foreground/20 relative flex h-32 w-48 items-center justify-center overflow-hidden rounded-lg border">
				{!loading && preview && !hasError && (
					<Image
						key={preview}
						src={preview}
						alt="图片预览"
						fill
						className="object-contain"
						unoptimized
						onLoad={() => setImageLoaded(true)}
						onError={() => setHasError(true)}
					/>
				)}

				{(loading || (hasPreview && !imageLoaded && !hasError)) && (
					<div className="absolute inset-0">
						<Skeleton className="h-full w-full" />
					</div>
				)}

				{hasError && !loading && (
					<span className="absolute px-2 text-center text-xs text-red-400">
						图片加载失败
					</span>
				)}

				{!hasPreview && !loading && (
					<span className="text-muted-foreground absolute text-xs">无预览</span>
				)}
			</div>
		</div>
	);
}
