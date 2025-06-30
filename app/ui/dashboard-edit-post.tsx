"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'nextjs-toploader/app'

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { FontStyleToggleGroup } from "@/ui/font-style-toggle-group";
import { PostContentEditor } from "@/ui/post-content-editor";

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
}

interface DashboardEditPostProps {
  postId: number;
}

export default function DashboardEditPost({ postId }: DashboardEditPostProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [headingLevel, setHeadingLevel] = useState<string>("");

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/post/byId/${postId}`, {

          credentials: "include",
        });
        if (!res.ok) throw new Error("获取文章失败");
        const data = await res.json();
        setPost(data);
        setTitle(data.title);
        setContent(data.content);
        setPublished(data.published);
        setSlug(data.slug || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);
  

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/post/byId/${postId}`, {

        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          content,
          published,
          slug: slug.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("保存失败");
      router.push("/dashboard/post");
    } catch (err) {
      alert("保存失败，请重试");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  const handleCancel = () => {
    router.push("/dashboard/post");
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer" onClick={() => router.push('/dashboard')}>仪表盘</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer" onClick={() => router.push('/dashboard/post')}>文章管理</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer" onClick={() => router.push(`/dashboard/post/${post?.id}`)}>
                  编辑文章
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-36" />
                  <Skeleton className="h-40 w-full" />
                </div>
                <Skeleton className="h-5 w-28" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ) : !post ? (
              <p className="text-muted-foreground">文章未找到</p>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-4">编辑文章 #{postId}</h1>

                <div className="mb-4">
                  <label htmlFor="title" className="block mb-1 font-semibold">
                    标题
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="slug" className="block mb-1 font-semibold">
                    自定义 URL Slug（可留空）
                  </label>
                  <Input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={saving}
                    placeholder="例如 how-to-use-app，留空则自动生成"
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="content" className="block mb-1 font-semibold">
                    内容
                  </label>
                  <FontStyleToggleGroup
                    content={content}
                    setContent={setContent}
                    headingLevel={headingLevel}
                    onHeadingLevelChange={setHeadingLevel}
                    textareaRef={textareaRef}
                  />
                </div>

                <PostContentEditor
                  content={content}
                  setContent={setContent}
                  textareaRef={textareaRef}
                  saving={saving}
                />
                <div className="mb-4 flex items-center gap-2">
                  <Checkbox
                    id="published"
                    checked={published}
                    onCheckedChange={(checked) => setPublished(!!checked)}
                    disabled={saving}
                  />
                  <label htmlFor="published">已发布</label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="disabled:opacity-50"
                  >
                    {saving ? "保存中..." : "保存"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={saving}
                    className="disabled:opacity-50"
                    variant="outline"
                  >
                    取消
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
