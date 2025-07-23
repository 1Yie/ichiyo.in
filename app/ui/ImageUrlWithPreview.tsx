import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState, useEffect } from "react";

export function ImageUrlWithPreview({
  labelName,
  labelClassName,
  src,
  setSrc,
}: {
  src: string;
  setSrc: (val: string) => void;
  labelName: string;
  labelClassName: string;
}) {
  const [preview, setPreview] = useState(src);

  // 防抖更新预览图
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPreview(src);
    }, 300);
    return () => clearTimeout(timeout);
  }, [src]);

  return (
    <div className="flex items-start gap-4">
      {/* 输入框 */}
      <div className="flex-1 space-y-2">
        <label htmlFor="src" className={labelClassName}>
          {labelName}
        </label>
        <Input
          id="src"
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="https://example.com/image.png"
        />
      </div>

      {/* 预览区域 */}
      <div className="w-48 h-32 flex items-center justify-center rounded-lg border border-gray-200 overflow-hidden bg-white">
        {preview ? (
          <Image
            src={preview}
            alt="图片预览"
            width={128}
            height={80}
            className="flex object-contain w-full h-full"
            unoptimized
          />
        ) : (
          <span className="text-xs text-gray-400">无预览</span>
        )}
      </div>
    </div>
  );
}
