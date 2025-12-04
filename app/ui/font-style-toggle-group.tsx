'use client';

import * as React from 'react';
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
	AlertCircle,
	StickyNote,
	Lightbulb,
	Bell,
	ShieldAlert,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const headingIcons = {
	h1: Heading1,
	h2: Heading2,
	h3: Heading3,
	h4: Heading4,
	h5: Heading5,
	h6: Heading6,
};

const STYLE_MARKERS = {
	bold: { start: '**', end: '**' },
	italic: { start: '*', end: '*' },
	underline: { start: '<u>', end: '</u>' },
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

	const detectActiveStyles = (selectedText: string) => {
		const boldStart = selectedText.startsWith('**');
		const boldEnd = selectedText.endsWith('**');
		const italicStart = selectedText.startsWith('*') && !boldStart;
		const italicEnd = selectedText.endsWith('*') && !boldEnd;
		const isTripleStar =
			selectedText.startsWith('***') && selectedText.endsWith('***');

		return {
			bold: (boldStart && boldEnd) || isTripleStar,
			italic: italicStart && italicEnd && !isTripleStar,
			underline:
				selectedText.startsWith('<u>') && selectedText.endsWith('</u>'),
		};
	};

	React.useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const handleSelectionChange = () => {
			const { selectionStart, selectionEnd } = textarea;
			if (selectionStart === selectionEnd) {
				setActiveStyles({ bold: false, italic: false, underline: false });
				return;
			}

			const selectedText = content.slice(selectionStart, selectionEnd);
			const newActiveStyles = detectActiveStyles(selectedText);
			setActiveStyles(newActiveStyles);
		};

		textarea.addEventListener('select', handleSelectionChange);
		textarea.addEventListener('click', handleSelectionChange);
		textarea.addEventListener('keyup', handleSelectionChange);

		return () => {
			textarea.removeEventListener('select', handleSelectionChange);
			textarea.removeEventListener('click', handleSelectionChange);
			textarea.removeEventListener('keyup', handleSelectionChange);
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
		let newText = '';
		let cursorStart = 0;
		let cursorEnd = 0;

		if (remove) {
			selectedText = selectedText.slice(before.length, -after.length);
			newText =
				content.slice(0, selectionStart) +
				selectedText +
				content.slice(selectionEnd);
			cursorStart = selectionStart;
			cursorEnd = selectionStart + selectedText.length;
		} else {
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

	const handleStyleClick = (style: 'bold' | 'italic' | 'underline') => {
		const markers = STYLE_MARKERS[style];
		const isActive = activeStyles[style];

		if (style === 'bold' && activeStyles.italic) {
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

		if (style === 'italic' && activeStyles.bold) {
			insertAtSelection(STYLE_MARKERS.bold.start, STYLE_MARKERS.bold.end, true);
			insertAtSelection(markers.start, markers.end);
			setActiveStyles({
				bold: false,
				italic: true,
				underline: activeStyles.underline,
			});
			return;
		}

		insertAtSelection(markers.start, markers.end, isActive);
		setActiveStyles((prev) => ({ ...prev, [style]: !isActive }));
	};

	const handleHeadingClick = (level: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const { selectionStart } = textarea;
		const lineStart = content.lastIndexOf('\n', selectionStart - 1) + 1;
		const headingPrefix = '#'.repeat(Number(level.replace('h', ''))) + ' ';
		let lineEnd = content.indexOf('\n', selectionStart);
		if (lineEnd === -1) lineEnd = content.length;

		const lineContent = content
			.slice(lineStart, lineEnd)
			.replace(/^#{1,6}\s*/, '');

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

	const insertAlertBlock = (type: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const { selectionStart } = textarea;
		const prefix = `> [!${type.toUpperCase()}]\n> `;

		const newText =
			content.slice(0, selectionStart) +
			`${prefix}请输入提示内容..\n\n` +
			content.slice(selectionStart);
		setContent(newText);

		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(
					selectionStart + prefix.length,
					selectionStart + prefix.length + 9
				);
			}
		}, 0);
	};

	return (
		<div className="mb-2 flex flex-wrap items-center gap-3">
			<ToggleGroup
				type="single"
				variant="outline"
				aria-label="标题级别"
				value={headingLevel}
				onValueChange={(val) => val && handleHeadingClick(val)}
			>
				{(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((level) => {
					const Icon = headingIcons[level];
					return (
						<ToggleGroupItem
							key={level}
							value={level}
							title={level.toUpperCase()}
							className="flex items-center justify-center"
						>
							<Icon className="h-4 w-4" />
						</ToggleGroupItem>
					);
				})}
			</ToggleGroup>

			<ToggleGroup
				type="multiple"
				variant="outline"
				aria-label="字体样式"
				value={Object.keys(activeStyles).filter((s) => activeStyles[s])}
			>
				<ToggleGroupItem
					value="bold"
					onClick={() => handleStyleClick('bold')}
					title="加粗"
					aria-pressed={activeStyles.bold}
				>
					<Bold className="h-4 w-4" />
				</ToggleGroupItem>
				<ToggleGroupItem
					value="italic"
					onClick={() => handleStyleClick('italic')}
					title="斜体"
					aria-pressed={activeStyles.italic}
				>
					<Italic className="h-4 w-4" />
				</ToggleGroupItem>
				<ToggleGroupItem
					value="underline"
					onClick={() => handleStyleClick('underline')}
					title="下划线"
					aria-pressed={activeStyles.underline}
				>
					<Underline className="h-4 w-4" />
				</ToggleGroupItem>
			</ToggleGroup>

			<ToggleGroup
				type="single"
				variant="outline"
				className="flex"
				aria-label="提示块插入"
			>
				<ToggleGroupItem
					value="WARNING"
					title="警告提示"
					onClick={() => insertAlertBlock('WARNING')}
					className="flex items-center justify-center"
				>
					<AlertCircle className="h-4 w-4 text-yellow-600" />
				</ToggleGroupItem>
				<ToggleGroupItem
					value="NOTE"
					title="笔记提示"
					onClick={() => insertAlertBlock('NOTE')}
					className="flex items-center justify-center"
				>
					<StickyNote className="h-4 w-4 text-blue-500" />
				</ToggleGroupItem>
				<ToggleGroupItem
					value="TIP"
					title="技巧提示"
					onClick={() => insertAlertBlock('TIP')}
					className="flex items-center justify-center"
				>
					<Lightbulb className="h-4 w-4 text-green-500" />
				</ToggleGroupItem>
				<ToggleGroupItem
					value="IMPORTANT"
					title="重要提示"
					onClick={() => insertAlertBlock('IMPORTANT')}
					className="flex items-center justify-center"
				>
					<Bell className="h-4 w-4 text-red-500" />
				</ToggleGroupItem>
				<ToggleGroupItem
					value="CAUTION"
					title="小心提示"
					onClick={() => insertAlertBlock('CAUTION')}
					className="flex items-center justify-center"
				>
					<ShieldAlert className="h-4 w-4 text-orange-500" />
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}
