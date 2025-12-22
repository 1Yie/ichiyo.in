import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import remarkAlerts from 'remark-alerts';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { Element as HastElement, Text as HastText, Root } from 'hast';

export async function parseMarkdown(markdown: string): Promise<string> {
	return processMarkdown(markdown, { withAnchors: true });
}

export async function parseMarkdownForFeed(markdown: string): Promise<string> {
	return processMarkdown(markdown, { withAnchors: false });
}

async function processMarkdown(
	markdown: string,
	options: { withAnchors: boolean }
): Promise<string> {
	try {
		const processor = unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkDirective)
			.use(transformCenterDirective);

		if (options.withAnchors) {
			processor
				.use(remarkAlerts)
				.use(remarkMath)
				.use(remarkRehype, { allowDangerousHtml: true, math: true })
				.use(rehypeKatex)
				.use(rehypeHighlight)
				.use(addCodeHeaders)
				.use(addHeadingAnchors)
				.use(transformFootnoteLinks);
		} else {
			processor.use(remarkRehype, { allowDangerousHtml: true });
		}

		processor.use(rehypeStringify, { allowDangerousHtml: true });

		const result = await processor.process(markdown);
		return result.toString();
	} catch (error) {
		console.error('Markdown parsing failed:', error);
		throw new Error('Failed to parse markdown content.');
	}
}

/*
 
  自定义语法: 居中

  示例:

  :::center
  你好！！！
  :::

 */
function transformCenterDirective() {
	return (tree: Root) => {
		visit(
			tree,
			'containerDirective',
			(node: {
				type: string;
				name: string;
				data?: { hName?: string; hProperties?: { class: string } };
			}) => {
				if (node.type === 'containerDirective' && node.name === 'center') {
					const data = node.data || (node.data = {});
					data.hName = 'div';
					data.hProperties = { class: 'text-center' };
				}
			}
		);
	};
}

function addHeadingAnchors() {
	return (tree: Root) => {
		visit(tree, 'element', (node: HastElement) => {
			if (/^h[1-6]$/.test(node.tagName)) {
				const text = node.children
					.filter((child): child is HastText => child.type === 'text')
					.map((child) => child.value)
					.join('');

				node.properties = node.properties || {};
				node.properties.id = text;

				node.children.push({
					type: 'element',
					tagName: 'span',
					properties: {
						class: 'anchor-link',
						onclick: `const el=document.getElementById('${text}');if(el){const rect=el.getBoundingClientRect();const offsetTop=window.pageYOffset+rect.top-80;window.scrollTo({top:offsetTop,behavior:'smooth'});history.replaceState(null,'','#${text}');}`,
					},
					children: [{ type: 'text', value: '#' }],
				});
			}
		});
	};
}

function transformFootnoteLinks() {
	return (tree: Root) => {
		visit(tree, 'element', (node: HastElement) => {
			if (
				node.properties?.id &&
				typeof node.properties.id === 'string' &&
				node.properties.id.startsWith('user-content-')
			) {
				node.properties.id = node.properties.id.replace('user-content-', '');
			}

			if (
				node.tagName === 'a' &&
				node.properties?.href &&
				typeof node.properties.href === 'string' &&
				node.properties.href.startsWith('#')
			) {
				let targetId = node.properties.href.slice(1);

				if (targetId.startsWith('user-content-')) {
					targetId = targetId.replace('user-content-', '');
				}

				delete node.properties.href;

				node.properties.onclick = `event.preventDefault();const el=document.getElementById('${targetId}');if(el){const rect=el.getBoundingClientRect();const offsetTop=window.pageYOffset+rect.top-80;window.scrollTo({top:offsetTop,behavior:'smooth'});history.replaceState(null,'','#${targetId}');}`;
				node.properties.style = 'cursor:pointer;';
			}
		});
	};
}

function addCodeHeaders() {
	return (tree: Root) => {
		visit(tree, 'element', (node: HastElement) => {
			if (node.tagName === 'pre') {
				const code = node.children.find(
					(child): child is HastElement =>
						child.type === 'element' && child.tagName === 'code'
				);
				if (code && code.properties?.className) {
					const className = Array.isArray(code.properties.className)
						? code.properties.className.join(' ')
						: typeof code.properties.className === 'string'
							? code.properties.className
							: '';
					const match = className.match(/language-(\w+)/);
					const lang = match ? match[1] : 'text';
					const displayLang = lang.toUpperCase();

					const header: HastElement = {
						type: 'element',
						tagName: 'div',
						properties: { class: 'code-header' },
						children: [
							{
								type: 'element',
								tagName: 'span',
								properties: { class: 'code-lang' },
								children: [{ type: 'text', value: displayLang }],
							},
							{
								type: 'element',
								tagName: 'button',
								properties: {
									class: 'code-copy',
									title: '复制代码',
									onclick: `navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent).then(() => { if (window.toast) window.toast.success('内容已复制到剪贴板'); }).catch(() => { if (window.toast) window.toast.error('复制失败'); });`,
								},
								children: [
									{
										type: 'element',
										tagName: 'svg',
										properties: {
											width: '16',
											height: '16',
											viewBox: '0 0 24 24',
											fill: 'none',
											stroke: 'currentColor',
											'stroke-width': '2',
										},
										children: [
											{
												type: 'element',
												tagName: 'rect',
												properties: {
													x: '9',
													y: '9',
													width: '13',
													height: '13',
													rx: '2',
													ry: '2',
												},
												children: [],
											},
											{
												type: 'element',
												tagName: 'path',
												properties: {
													d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
												},
												children: [],
											},
										],
									},
								],
							},
						],
					};

					node.children.unshift(header);
				}
			}
		});
	};
}
