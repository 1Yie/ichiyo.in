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
	// 防抖更新 preview
	useEffect(() => {
		setImageLoaded(false);

		const timeout = setTimeout(() => {
			setPreview(src);
		}, 300);

		return () => clearTimeout(timeout);
	}, [src]);

	// 每次预览地址变更，清除错误状态
	useEffect(() => {
		setHasError(false);
	}, [preview]);

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
				{/* 正常显示图片 */}
				{!loading && preview && !hasError && (
					<Image
						src={preview}
						alt="图片预览"
						fill
						className="object-contain"
						unoptimized
						onLoad={() => setImageLoaded(true)}
						onError={() => {
							setHasError(true);
							setImageLoaded(false);
						}}
					/>
				)}

				{/* 骨架屏遮罩 */}
				{(loading || (hasPreview && !imageLoaded && !hasError)) && (
					<div className="absolute inset-0">
						<Skeleton className="h-full w-full" />
					</div>
				)}

				{/* 加载失败提示 */}
				{hasError && !loading && (
					<span className="absolute px-2 text-center text-xs text-red-400">
						图片加载失败
					</span>
				)}

				{/* 无图片预览时 */}
				{!hasPreview && !loading && (
					<span className="text-muted-foreground absolute text-xs">无预览</span>
				)}
			</div>
		</div>
	);
}
