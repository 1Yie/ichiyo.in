"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { parseMarkdown } from "@/lib/markdown";
import { Skeleton } from "@/components/ui/skeleton";
import Comments from "@/components/ui/comment";
import SplitText from "@/components/ui/split-text";

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    uid: number;
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/bySlug/${params.slug}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const postData: Post = await res.json();
        setPost(postData);
        const html = await parseMarkdown(postData.content);
        setHtmlContent(html);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  if (error) {
    notFound();
  }

  if (loading || !post) {
    return (
      <div className="border-b">
        <section className="section-base p-12">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-5 w-1/6" />
          </div>
        </section>
        <section className="section-base px-[120px] py-[20px] max-[768px]:px-[20px] max-[768px]:py-[30px]">
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="border-b">
        <section className="section-base p-12 bg-squares">
          <SplitText
            text={post.title}
            className="text-5xl font-bold mt-2 mb-2"
            delay={30}
            duration={0.4}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
          />
          <p className="text-gray-600 text-2xl mb-3 dark:text-gray-300">
            {post.author?.id}
          </p>
          <p className="text-gray-500 text-lg dark:text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </section>
      </div>
      <div className="border-b">
        <section className="section-base">
          <div
            className="post-style max-[768px]:px-[20px] max-[768px]:py-[30px] py-[20px] px-[120px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </section>
      </div>
      <div className="border-b">
        <section className="section-base p-[50px_120px] max-[768px]:p-[20px_30px] artalk">
          <Comments />
        </section>
      </div>
    </>
  );
}
