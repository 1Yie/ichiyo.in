import { type MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * 格式化版本号为标准 ISO Date
 * 将 20251222T054030547Z 转换为 2025-12-22T05:40:30.547Z
 */
function parseVersionDate(versionStr: string): Date {
	try {
		const formatted = versionStr
			.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T')
			.replace(/T(\d{2})(\d{2})(\d{2})/, 'T$1:$2:$3.');
		const date = new Date(formatted);
		return isNaN(date.getTime()) ? new Date() : date;
	} catch {
		return new Date();
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
		'http://localhost:3000';

	let buildDate: Date;
	try {
		const versionPath = path.join(process.cwd(), 'public', 'version.json');
		const fileContent = fs.readFileSync(versionPath, 'utf8');
		const { version } = JSON.parse(fileContent);
		buildDate = parseVersionDate(version);
	} catch (e) {
		buildDate = new Date();
	}

	const posts = await prisma.post.findMany({
		select: {
			slug: true,
			updatedAt: true,
		},
		where: {
			published: true,
		},
		orderBy: { updatedAt: 'desc' },
	});

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: buildDate,
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: buildDate,
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/blog`,
			lastModified: posts[0]?.updatedAt ?? buildDate,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/link`,
			lastModified: buildDate,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
	];

	const dynamicRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: post.updatedAt,
		changeFrequency: 'weekly',
		priority: 0.7,
	}));

	return [...staticRoutes, ...dynamicRoutes];
}
