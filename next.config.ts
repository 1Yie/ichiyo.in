import type { NextConfig } from 'next';
import { join } from 'path';
import { writeFileSync } from 'fs';

const version = new Date().toISOString().replace(/[:.-]/g, '');
writeFileSync(
	join(process.cwd(), 'public', 'version.json'),
	JSON.stringify({ version }),
	'utf-8'
);

const nextConfig: NextConfig = {
	reactCompiler: true,

	turbopack: {},

	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'file.ichiyo.in',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'dn-qiniu-avatar.qbox.me',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'iph.href.lu',
				pathname: '/**',
			},
		],
	},

	compiler: {
		removeConsole:
			process.env.NODE_ENV === 'production'
				? {
						exclude: ['error', 'info'],
					}
				: false,
	},

	env: {
		NEXT_PUBLIC_KEY_TTL_MS: process.env.KEY_TTL_MS,
	},

	async rewrites() {
		return [
			{ source: '/rss', destination: '/feed.xml' },
			{ source: '/rss.xml', destination: '/feed.xml' },
			{ source: '/feed', destination: '/feed.xml' },
		];
	},

	async headers() {
		return [
			{
				source: '/version.json',
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate, max-age=0',
					},
				],
			},
			{
				source: '/api/version/stream',
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate, max-age=0',
					},
					{
						key: 'Connection',
						value: 'keep-Alive',
					},
					{
						key: 'Content-Type',
						value: 'text/event-stream',
					},
				],
			},
		];
	},
};

export default nextConfig;
