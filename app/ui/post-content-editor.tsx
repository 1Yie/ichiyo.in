import React from "react";
import { useEffect, useState } from "react";
import { parseMarkdown } from "@/lib/markdown";
import { Textarea } from "@/components/ui/textarea";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface PostContentEditorProps {
  content: string;
  setContent: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  saving: boolean;
}

export function PostContentEditor({
  content,
  setContent,
  textareaRef,
  saving,
}: PostContentEditorProps) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    async function parse() {
      const result = await parseMarkdown(content);
      setHtml(result);
    }
    parse();
  }, [content]);
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="rounded-md border mb-4 bg-gray-50 h-full w-full"
    >
      <ResizablePanel defaultSize={50} minSize={30} className="p-2">
        <Textarea
          ref={textareaRef}
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-full bg-white"
          disabled={saving}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={50}
        minSize={30}
        className="p-4 w-2"
      >
        <div 
          className="post-style"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
