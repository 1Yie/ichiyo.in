import { Tags, Rss, Archive } from 'lucide-react';
import BlogSearch from '@/ui/blog-search';
import Link from 'next/link';

export default function BlogPanel() {
	return (
		<div className="bg-diagonal-stripes-sm border-b">
			<section className="section-base flex flex-col gap-3 px-4 py-3 sm:flex-row sm:justify-between sm:gap-0 sm:py-1.5">
				<div className="flex items-center justify-between sm:justify-start">
					<div className="flex items-center gap-4">
						<Link
							href="/tags"
							className="hover:text-foreground/60 flex items-center gap-1 text-lg transition-colors"
						>
							<Tags size={19} />
							Tags
						</Link>
						<Link
							href="/feed.xml"
							className="hover:text-foreground/60 flex items-center gap-1 text-lg transition-colors"
						>
							<Rss size={17} />
							Rss
						</Link>
						<Link
							href="/archive"
							className="hover:text-foreground/60 flex items-center gap-1 text-lg transition-colors"
						>
							<Archive size={17} />
							Archive
						</Link>
					</div>
				</div>
				<div className="w-full sm:w-auto sm:max-w-xs">
					<BlogSearch />
				</div>
			</section>
		</div>
	);
}
