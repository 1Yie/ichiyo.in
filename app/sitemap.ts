import { type MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
	const posts = await prisma.post.findMany({
		select: {
			slug: true,
			updatedAt: true,
		},
		where: {
			published: true,
		},
	});

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'yearly',
			priority: 1,
		},
		{
			url: baseUrl + '/about',
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: baseUrl + '/blog',
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: baseUrl + '/link',
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.7,
		},
	];

	const dynamicRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
		url: baseUrl + '/blog/' + post.slug,
		lastModified: post.updatedAt,
		changeFrequency: 'weekly',
		priority: 0.7,
	}));

	return [...staticRoutes, ...dynamicRoutes];
}
