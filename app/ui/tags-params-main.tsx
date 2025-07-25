"use client";

import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";

interface Post {
  id: number;
  slug: string;
  title: string;
  createdAt: string;
  authors: {
    user: {
      uid: number;
      id: string;
      email: string;
    };
  }[];
  tags: {
    id: number;
    name: string;
  }[];
}

interface TagData {
  tag: { id: number; name: string };
  posts: Post[];
}

export default function TagParams({ data }: { data: TagData }) {
  const router = useRouter();

  return (
    <div className="border-b">
      <section className="section-base">
        {data.posts.length === 0 ? (
          <p className="p-4 text-center text-gray-500 dark:text-gray-400">
            暂无相关文章
          </p>
        ) : (
          <ul className="space-y-4">
            {[...data.posts]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((post) => (
                <li key={post.id} className="m-0 p-0 border-b last:border-b-0">
                  <div className="p-4 hover:bg-gray-50 dark:hover:bg-black transition-colors duration-300 cursor-pointer"
                    onClick={() => router.push(`/blog/${post.slug}`)}
                  >
                    <p className="text-2xl font-semibold">
                      {post.title || post.slug}
                    </p>

                    <div className="flex flex-row gap-2 items-center justify-start flex-wrap">
                      {post.authors.length > 0 && (
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                          {post.authors.map((author, index) => (
                            <span key={`${post.id}-author-${author.user.uid}`}>
                              {index > 0 && ", "}
                              {author.user.id}
                            </span>
                          ))}
                        </p>
                      )}
                      <p className="text-lg text-gray-500 dark:text-gray-600">·</p>
                      <p className="text-lg text-gray-500 dark:text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <Link
                            key={`tag-${post.id}-${tag.id}`}
                            href={`/tags/${encodeURIComponent(tag.name)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center bg-accent px-2 py-0.5 rounded-full text-sm font-medium text-accent-foreground cursor-pointer hover:bg-accent/80 transition"
                          >
                            <span className="text-accent-foreground/60 mr-1 select-none">#</span>
                            {tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
