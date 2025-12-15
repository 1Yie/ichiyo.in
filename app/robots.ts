import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: [
				'/dashboard',
				'/dashboard/*',
				'/auth/*',
				'/api/',
				'/api/*',
				'/private/',
				'/private/*',
			],
		},
		sitemap: 'https://ichiyo.in/sitemap.xml',
	};
}
