"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const headingIcons = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
};

const STYLE_MARKERS = {
  bold: { start: "**", end: "**" },
  italic: { start: "*", end: "*" },
  underline: { start: "<u>", end: "</u>" },
};

interface FontStyleToggleGroupProps {
  content: string;
  setContent: (value: string) => void;
  headingLevel: string;
  onHeadingLevelChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function FontStyleToggleGroup({
  content,
  setContent,
  headingLevel,
  onHeadingLevelChange,
  textareaRef,
}: FontStyleToggleGroupProps) {
  const [activeStyles, setActiveStyles] = React.useState<
    Record<string, boolean>
  >({
    bold: false,
    italic: false,
    underline: false,
  });

  // 改进的样式检测函数
  const detectActiveStyles = (selectedText: string) => {
    // 1. 先检测加粗（**包裹）
    const boldStart = selectedText.startsWith("**");
    const boldEnd = selectedText.endsWith("**");

    // 2. 检测斜体（*包裹，且不被**包含）
    const italicStart = selectedText.startsWith("*") && !boldStart;
    const italicEnd = selectedText.endsWith("*") && !boldEnd;

    // 3. 处理***特殊情况
    const isTripleStar =
      selectedText.startsWith("***") && selectedText.endsWith("***");

    return {
      bold: (boldStart && boldEnd) || isTripleStar,
      italic: italicStart && italicEnd && !isTripleStar,
      underline:
        selectedText.startsWith("<u>") && selectedText.endsWith("</u>"),
    };
  };

  // 检测选区变化并更新按钮状态
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelectionChange = () => {
      const { selectionStart, selectionEnd } = textarea;
      if (selectionStart === selectionEnd) {
        setActiveStyles({
          bold: false,
          italic: false,
          underline: false,
        });
        return;
      }

      const selectedText = content.slice(selectionStart, selectionEnd);
      const newActiveStyles = detectActiveStyles(selectedText);
      setActiveStyles(newActiveStyles);
    };

    // 添加事件监听
    textarea.addEventListener("select", handleSelectionChange);
    textarea.addEventListener("click", handleSelectionChange);
    textarea.addEventListener("keyup", handleSelectionChange);

    return () => {
      textarea.removeEventListener("select", handleSelectionChange);
      textarea.removeEventListener("click", handleSelectionChange);
      textarea.removeEventListener("keyup", handleSelectionChange);
    };
  }, [content, textareaRef]);

  const insertAtSelection = (
    before: string,
    after = before,
    remove = false
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    let selectedText = content.slice(selectionStart, selectionEnd);

    let newText = "";
    let cursorStart = 0;
    let cursorEnd = 0;

    if (remove) {
      // 移除样式标记
      selectedText = selectedText.slice(before.length, -after.length);
      newText =
        content.slice(0, selectionStart) +
        selectedText +
        content.slice(selectionEnd);
      cursorStart = selectionStart;
      cursorEnd = selectionStart + selectedText.length;
    } else {
      // 添加样式标记
      newText =
        content.slice(0, selectionStart) +
        before +
        selectedText +
        after +
        content.slice(selectionEnd);
      cursorStart = selectionStart + before.length;
      cursorEnd = selectionEnd + before.length;
    }

    setContent(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorStart, cursorEnd);
      }
    }, 0);
  };

  const handleStyleClick = (style: "bold" | "italic" | "underline") => {
    const markers = STYLE_MARKERS[style];
    const isActive = activeStyles[style];

    // 特殊处理加粗/斜体的嵌套情况
    if (style === "bold" && activeStyles.italic) {
      // 如果已经是斜体，先移除斜体再添加加粗
      insertAtSelection(
        STYLE_MARKERS.italic.start,
        STYLE_MARKERS.italic.end,
        true
      );
      insertAtSelection(markers.start, markers.end);
      setActiveStyles({
        bold: true,
        italic: false,
        underline: activeStyles.underline,
      });
      return;
    }

    if (style === "italic" && activeStyles.bold) {
      // 如果已经是加粗，先移除加粗再添加斜体
      insertAtSelection(STYLE_MARKERS.bold.start, STYLE_MARKERS.bold.end, true);
      insertAtSelection(markers.start, markers.end);
      setActiveStyles({
        bold: false,
        italic: true,
        underline: activeStyles.underline,
      });
      return;
    }

    // 正常情况处理
    insertAtSelection(markers.start, markers.end, isActive);
    setActiveStyles((prev) => ({ ...prev, [style]: !isActive }));
  };

  const handleHeadingClick = (level: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart } = textarea;

    const lineStart = content.lastIndexOf("\n", selectionStart - 1) + 1;
    const headingPrefix = "#".repeat(Number(level.replace("h", ""))) + " ";

    let lineEnd = content.indexOf("\n", selectionStart);
    if (lineEnd === -1) lineEnd = content.length;

    const lineContent = content
      .slice(lineStart, lineEnd)
      .replace(/^#{1,6}\s*/, "");

    const newText =
      content.slice(0, lineStart) +
      headingPrefix +
      lineContent +
      content.slice(lineEnd);

    setContent(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const pos = lineStart + headingPrefix.length;
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 0);

    onHeadingLevelChange(level);
  };

  return (
    <div className="flex items-center space-x-4 mb-2">
      <ToggleGroup
        type="single"
        variant="outline"
        aria-label="标题级别"
        className="flex"
        value={headingLevel}
        onValueChange={(val) => val && handleHeadingClick(val)}
      >
        {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((level) => {
          const Icon = headingIcons[level];
          return (
            <ToggleGroupItem
              key={level}
              value={level}
              aria-label={level}
              title={level.toUpperCase()}
              className="flex items-center justify-center"
            >
              <Icon className="h-5 w-5" />
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      <ToggleGroup
        type="multiple"
        variant="outline"
        aria-label="字体样式"
        className="flex"
        value={Object.keys(activeStyles).filter((style) => activeStyles[style])}
      >
        <ToggleGroupItem
          value="bold"
          onClick={() => handleStyleClick("bold")}
          title="加粗"
          aria-pressed={activeStyles.bold}
        >
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          onClick={() => handleStyleClick("italic")}
          title="斜体"
          aria-pressed={activeStyles.italic}
        >
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          onClick={() => handleStyleClick("underline")}
          title="下划线"
          aria-pressed={activeStyles.underline}
        >
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
