import React from 'react';
import { useEffect, useState } from 'react';
import { parseMarkdown } from '@/lib/markdown';
import { Textarea } from '@/components/ui/textarea';
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '@/components/ui/resizable';

interface PostContentEditorProps {
	content: string;
	setContent: (content: string) => void;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	saving: boolean;
	placeholder?: string;
}

export function PostContentEditor({
	content,
	setContent,
	textareaRef,
	saving,
	placeholder,
}: PostContentEditorProps) {
	const [html, setHtml] = useState('');
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
			className="dark:bg-muted/15 mb-4 h-full w-full rounded-md border bg-gray-50"
		>
			<ResizablePanel defaultSize={50} minSize={30} className="p-2">
				<Textarea
					ref={textareaRef}
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className="dark:bg-muted h-full bg-white"
					placeholder={placeholder}
					disabled={saving}
				/>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={50} minSize={30} className="w-2 p-4">
				<div
					className="post-style"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
