"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [myUid, setMyUid] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<
    { uid: number; id: string; email: string }[]
  >([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);

  // 获取当前用户
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data.user?.uid != null) {
          const uid = String(data.user.uid);
          setMyUid(uid);
          setSelectedAuthors([uid]);
        }
      });
  }, []);

  // 获取所有用户
  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.users) {
          setAllUsers(data.users);
        }
      });
  }, []);

  const handleAddAuthor = (uid: string) => {
    if (!selectedAuthors.includes(uid)) {
      setSelectedAuthors([...selectedAuthors, uid]);
    }
  };

  const handleRemoveAuthor = (uid: string) => {
    if (uid === myUid) return;
    setSelectedAuthors(selectedAuthors.filter((id) => id !== uid));
  };

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
          authors: selectedAuthors.map(Number),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data?.error || "创建失败，请重试";
        throw new Error(msg);
      }

      router.push("/dashboard/post");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "创建失败，请重试";
      setErrorMessage(msg);
      setShowErrorDialog(true);
      console.error("创建文章失败:", err);
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
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  仪表盘
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard/post")}
                >
                  文章管理
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/post/new`)}
                >
                  新建文章
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* 内容主体 */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            <h1 className="text-2xl font-bold mb-4">新建文章</h1>

            {/* 标题 */}
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

            {/* Slug */}
            <div className="mb-4">
              <label htmlFor="slug" className="block mb-1 font-semibold">
                自定义 URL Slug（可留空）
              </label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="例如 how-to-use-app"
                disabled={saving}
              />
            </div>

            {/* 作者 */}
            <div className="mb-4">
              <label htmlFor="authors" className="block mb-1 font-semibold">
                作者
              </label>
              <p className="mb-2 text-sm text-gray-500">
                多作者文章可添加多个作者，自己为必选且不可移除
              </p>
              <Select onValueChange={(val) => handleAddAuthor(val)} value="">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="添加作者" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers
                    .filter(
                      (u) =>
                        String(u.uid) !== myUid &&
                        !selectedAuthors.includes(String(u.uid))
                    )
                    .map((user) => (
                      <SelectItem key={user.uid} value={String(user.uid)}>
                        {user.id} ({user.email})
                      </SelectItem>
                    ))}
                  {allUsers.filter(
                    (u) =>
                      String(u.uid) !== myUid &&
                      !selectedAuthors.includes(String(u.uid))
                  ).length === 0 && (
                    <div className="p-2 text-sm text-gray-400">
                      无更多作者可添加
                    </div>
                  )}
                </SelectContent>
              </Select>

              {/* 已选作者 */}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedAuthors.map((uid) => {
                  const user = allUsers.find((u) => String(u.uid) === uid);
                  if (!user) return null;
                  const isSelf = uid === myUid;
                  return (
                    <div
                      key={uid}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm border ${
                        isSelf
                          ? "bg-gray-100 text-gray-700 border-gray-300"
                          : "bg-blue-100 text-blue-700 border-blue-300"
                      }`}
                    >
                      {user.id}
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAuthor(uid)}
                          className="ml-1 hover:text-red-600"
                          aria-label="移除作者"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
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

            {/* 内容编辑器 */}
            <PostContentEditor
              content={content}
              setContent={setContent}
              textareaRef={textareaRef}
              saving={saving}
            />

            {/* 发布 */}
            <div className="mb-4 flex items-center gap-2">
              <Checkbox
                id="published"
                checked={published}
                onCheckedChange={(c) => setPublished(!!c)}
                disabled={saving}
              />
              <label htmlFor="published">立即发布</label>
            </div>

            {/* 按钮 */}
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

      {/* 错误弹窗 */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>出错了</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>关闭</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
