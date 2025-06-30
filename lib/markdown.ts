import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import remarkAlerts from "remark-alerts";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { Element as HastElement, Text as HastText } from "hast";

export async function parseMarkdown(markdown: string): Promise<string> {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkAlerts)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeHighlight)
      .use(addHeadingAnchors)
      .use(rehypeStringify, { allowDangerousHtml: true });

    const result = await processor.process(markdown);
    return result.toString();
  } catch (error) {
    console.error("Markdown parsing failed:", error);
    throw new Error("Failed to parse markdown content.");
  }
}

function addHeadingAnchors() {
  return (tree: import("hast").Root) => {
    visit(tree, "element", (node: HastElement) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        const text = node.children
          .filter((child): child is HastText => child.type === "text")
          .map((child) => child.value)
          .join("");

        node.properties = node.properties || {};
        node.properties.id = text;

        node.children.push({
          type: "element",
          tagName: "span",
          properties: {
            class: "anchor-link",
            onclick: `const el=document.getElementById('${text}');if(el){el.scrollIntoView({behavior:'smooth'});history.replaceState(null,'','#${text}');}`,
          },
          children: [{ type: "text", value: "#" }],
        });
      }
    });
  };
}
