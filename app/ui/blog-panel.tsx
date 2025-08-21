import { Tags, Rss, Archive } from "lucide-react";
import BlogSearch from "@/ui/blog-search";
import Link from "next/link";

export default function BlogPanel() {
  return (
    <div className="border-b bg-diagonal-stripes-sm">
      <section className="section-base flex flex-col sm:flex-row sm:justify-between px-4 py-3 sm:py-1.5 gap-3 sm:gap-0">
        <div className="flex items-center justify-between sm:justify-start">
          <div className="flex items-center gap-4">
            <Link
              href="/tags"
              className="flex items-center gap-1 text-lg transition-colors hover:text-foreground/60"
            >
              <Tags size={19} />
              Tags
            </Link>
            <Link
              href="/feed.xml"
              className="flex items-center gap-1 text-lg transition-colors hover:text-foreground/60"
            >
              <Rss size={17} />
              Rss
            </Link>
            <Link
              href="/archive"
              className="flex items-center gap-1 text-lg transition-colors hover:text-foreground/60"
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
