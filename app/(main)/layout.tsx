import type { Metadata } from 'next';
import { Ubuntu_Sans, Source_Code_Pro, Raleway } from 'next/font/google';
import '@/app/globals.css';

import ClientThemeWrapper from '@/app/(main)/client-wrapper';

import NextTopLoader from 'nextjs-toploader';
import ImageZoom from '@/ui/img-zoom';
import { Toaster } from '@/components/ui/sonner';

import Header from '@/app/ui/header';
import Footer from '@/app/ui/footer';
import { ThemeProvider } from 'next-themes';
import FaviconSwitcher from '@/lib/favicon-switcher';
import { UserProvider } from '@/contexts/user-context';
import ScrollToTop from '@/hooks/use-scroll-to-top';
import ScrollToTopButton from '@/ui/scroll-to-top-button';

export const metadata: Metadata = {
	title: 'ichiyo (@1Yie)',
	description: '存活于二十一世纪の互联网 / ichiyo (@1Yie).',
	keywords: [
		'ichiyo',
		'1Yie',
		'personal website',
		'developer',
		'designer',
		'一叶',
	],
	openGraph: {
		title: 'ichiyo (@1Yie)',
		description: '存活于二十一世纪の互联网 / ichiyo (@1Yie).',
		url: 'https://ichiyo.in',
		siteName: 'ichiyo (@1Yie)',
		images: [
			{
				url: 'https://ichiyo.in/logo_light.svg',
				width: 1200,
				height: 630,
				alt: 'ichiyo (@1Yie)',
			},
		],
		locale: 'zh_CN',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'ichiyo (@1Yie)',
		description: '存活于二十一世纪の互联网 / ichiyo (@1Yie).',
		images: ['https://ichiyo.in/logo_light.svg'],
	},
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon.ico',
		apple: '/favicon.ico',
	},
	metadataBase: new URL('https://ichiyo.in'),
	alternates: {
		canonical: 'https://ichiyo.in',
	},
};

const ubuntu = Ubuntu_Sans({
	subsets: ['latin'],
	weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
	style: ['normal', 'italic'],
	display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
	subsets: ['latin'],
	weight: ['500'],
	display: 'swap',
});

const raleway = Raleway({
	subsets: ['latin'],
	weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
	display: 'swap',
});

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const jsonLdWebsite = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'ichiyo (@1Yie)',
		url: 'https://ichiyo.in',
		potentialAction: {
			'@type': 'SearchAction',
			target: 'https://ichiyo.in/search?q={search_term_string}',
			'query-input': 'required name=search_term_string',
		},
	};

	const jsonLdNav = {
		'@context': 'https://schema.org',
		'@type': 'SiteNavigationElement',
		name: ['首页', '博客', '关于', '友链'],
		url: [
			'https://ichiyo.in',
			'https://ichiyo.in/blog',
			'https://ichiyo.in/about',
			'https://ichiyo.in/link',
		],
	};

	return (
		<html lang="zh-CN">
			<body
				className={`antialiased ${ubuntu.className} ${sourceCodePro.className} ${raleway.className}`}
			>
				<ClientThemeWrapper>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						enableColorScheme={false}
					>
						<UserProvider>
							<FaviconSwitcher />
							<ImageZoom />
							<NextTopLoader
								color="var(--foreground)"
								initialPosition={0.08}
								crawlSpeed={200}
								height={3}
								crawl={true}
								showSpinner={false}
								zIndex={9999}
								easing="ease"
								speed={200}
								shadow="0 0 10px var(--foreground),0 0 5px var(--foreground)"
							/>
							<Header />
							<Toaster richColors position="top-center" />
							{children}
							<ScrollToTopButton />
							<Footer />
						</UserProvider>
					</ThemeProvider>
				</ClientThemeWrapper>

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
				/>

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdNav) }}
				/>
			</body>
		</html>
	);
}
