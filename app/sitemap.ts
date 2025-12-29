import { type MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * 格式化版本号为标准 ISO Date
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

	const [posts, tags] = await Promise.all([
		prisma.post.findMany({
			select: {
				slug: true,
				updatedAt: true,
			},
			where: { published: true },
			orderBy: { updatedAt: 'desc' },
		}),
		prisma.tag.findMany({
			select: {
				name: true,
				posts: {
					select: { updatedAt: true },
					orderBy: { updatedAt: 'desc' },
					take: 1,
				},
			},
			where: {
				posts: { some: { published: true } },
			},
		}),
	]);

	const latestPostUpdate = posts[0]?.updatedAt ?? buildDate;

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: latestPostUpdate,
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
			lastModified: latestPostUpdate,
			changeFrequency: 'daily',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/archive`,
			lastModified: latestPostUpdate,
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/tags`,
			lastModified: latestPostUpdate,
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${baseUrl}/link`,
			lastModified: buildDate,
			changeFrequency: 'monthly',
			priority: 0.6,
		},
	];

	const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
		url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
		lastModified: post.updatedAt,
		changeFrequency: 'weekly',
		priority: 0.8,
	}));

	const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
		url: `${baseUrl}/tags/${encodeURIComponent(tag.name)}`,
		lastModified: tag.posts[0]?.updatedAt ?? buildDate,
		changeFrequency: 'weekly',
		priority: 0.6,
	}));

	return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
