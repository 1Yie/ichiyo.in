import { pinyin } from "pinyin-pro";

export function generateSlug(title: string): string {
  // 分割字符串为中文和非中文部分
  const segments: string[] = [];
  let currentSegment = '';
  let isLastChinese = false;

  for (const char of title) {
    const isChinese = /[\u4e00-\u9fa5]/.test(char);
    
    if (isChinese !== isLastChinese && currentSegment) {
      segments.push(currentSegment);
      currentSegment = '';
    }
    
    currentSegment += char;
    isLastChinese = isChinese;
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  // 处理每个片段
  const processedSegments = segments.map(segment => {
    if (/[\u4e00-\u9fa5]/.test(segment)) {
      // 中文部分转换为拼音
      return pinyin(segment, { 
        toneType: "none", 
        type: "string",
        nonZh: "consecutive" // 保持非中文连续
      })
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    } else {
      // 非中文部分保留原样（只做基本清理）
      return segment
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
    }
  });

  // 合并并清理多余的连字符
  return processedSegments
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}