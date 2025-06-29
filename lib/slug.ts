import { pinyin } from "pinyin-pro";

export function generateSlug(title: string): string {
  const hasChinese = /[\u4e00-\u9fa5]/.test(title);

  const baseSlug = hasChinese
    ? pinyin(title, { toneType: "none", type: "array" })
        .join("-")
        .replace(/[^a-zA-Z0-9-]/g, "")
    : title
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "-");

  return baseSlug.toLowerCase();
}
