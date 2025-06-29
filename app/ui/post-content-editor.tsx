"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
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
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="rounded-md border mb-4 bg-gray-50"
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
      <ResizablePanel defaultSize={50} minSize={30} className="p-4 overflow-auto">
        <div className="prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
