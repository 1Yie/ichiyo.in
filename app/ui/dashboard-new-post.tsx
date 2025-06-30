"use client";

import { useRef, useState } from "react";
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
import { FontStyleToggleGroup } from "@/ui/font-style-toggle-group";
import { PostContentEditor } from "@/ui/post-content-editor";

export default function DashboardNewPost() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [headingLevel, setHeadingLevel] = useState<string>("");

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          slug: slug.trim() || undefined,
          content,
          published,
        }),
      });
      if (!res.ok) throw new Error("创建失败");
      router.push("/dashboard/post");
    } catch (err) {
      alert("创建失败，请重试");
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
                <BreadcrumbLink className="cursor-pointer" onClick={() => router.push('/dashboard/post/new')}>
                  新建文章
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full min-w-0">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            <h1 className="text-2xl font-bold mb-4">新建文章</h1>

            {/* 标题输入 */}
            <div className="mb-4">
              <label htmlFor="title" className="block mb-1 font-semibold">
                标题
              </label>
              <Input
                id="title"
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
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="例如 how-to-use-app，留空则自动生成"
                disabled={saving}
              />
            </div>

            {/* 样式按钮 */}
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

            {/* 发布选择 */}
            <div className="mb-4 flex items-center gap-2">
              <Checkbox
                id="published"
                checked={published}
                onCheckedChange={(checked) => setPublished(!!checked)}
                disabled={saving}
              />
              <label htmlFor="published">立即发布</label>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? "创建中..." : "创建"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={saving}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
