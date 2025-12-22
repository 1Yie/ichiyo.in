import RSS from 'rss';
import { prisma } from '@/lib/prisma';
import { parseMarkdownForFeed } from '@/lib/markdown';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getBuildDate(): Date {
	try {
		const versionPath = path.join(process.cwd(), 'public', 'version.json');
		const fileContent = fs.readFileSync(versionPath, 'utf8');
		const { version } = JSON.parse(fileContent);
		const formatted = version
			.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T')
			.replace(/T(\d{2})(\d{2})(\d{2})/, 'T$1:$2:$3.');
		const date = new Date(formatted);
		return isNaN(date.getTime()) ? new Date() : date;
	} catch (error) {
		return new Date();
	}
}

export async function GET() {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
		'http://localhost:3000';
	const buildDate = getBuildDate();
	const rfc822Date = buildDate.toUTCString();

	const feed = new RSS({
		title: 'ichiyo | 博客',
		description: 'ichiyo 的个人博客',
		site_url: baseUrl,
		feed_url: `${baseUrl}/feed.xml`,
		language: 'zh-CN',
		copyright: `© ${new Date().getFullYear()} ichiyo`,
		generator: 'Next.js with RSS Package',
		pubDate: buildDate,
	});

	const posts = await prisma.post.findMany({
		where: { published: true },
		orderBy: { updatedAt: 'desc' },
		select: {
			title: true,
			slug: true,
			tags: { select: { name: true } },
			content: true,
			updatedAt: true,
		},
	});

	const feedItems = await Promise.all(
		posts.map(async (post) => {
			const html = await parseMarkdownForFeed(post.content);
			return {
				title: post.title,
				url: `${baseUrl}/blog/${post.slug}`,
				guid: post.slug,
				date: post.updatedAt,
				categories: post.tags.map((tag) => tag.name),
				description: html,
			};
		})
	);

	feedItems.forEach((item) => feed.item(item));

	let xml = feed.xml({ indent: true });

	/**
	 * 使用正则表达式替换 <lastBuildDate> 标签内的内容
	 * 无论库内部如何生成，都在输出前将其强行换成 version.json 的时间
	 */
	xml = xml.replace(
		/<lastBuildDate>.*?<\/lastBuildDate>/,
		`<lastBuildDate>${rfc822Date}</lastBuildDate>`
	);

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
		},
	});
}
