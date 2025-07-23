"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "nextjs-toploader/app";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { FontStyleToggleGroup } from "@/ui/font-style-toggle-group";
import { PostContentEditor } from "@/ui/post-content-editor";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

interface Post {
  id: number;
  title: string;
  slug?: string;
  content: string;
  published: boolean;
  authors: {
    user: { uid: number; id: string; email: string; name?: string };
  }[];
}

interface User {
  uid: number;
  id: string;
  email: string;
  name?: string;
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

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUserUid, setCurrentUserUid] = useState<number | null>(null);
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [headingLevel, setHeadingLevel] = useState<string>("");

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPostAndUsers() {
      setLoading(true);
      try {
        // 1. 获取文章详情
        const postRes = await fetch(`/api/post/byId/${postId}`, {
          credentials: "include",
        });
        if (!postRes.ok) throw new Error("获取文章失败");
        const postData = await postRes.json();
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setPublished(postData.published);
        setSlug(postData.slug || "");
        setSelectedTags(
          postData.tags?.map((t: { name: string }) => t.name) || []
        );
        // 默认选中文章的作者 uid
        setSelectedAuthors(
          postData.authors.map((a: { user: User }) => a.user.uid)
        );

        // 2. 获取当前登录用户信息和所有用户列表
        const [meRes, usersRes] = await Promise.all([
          fetch("/api/me", { credentials: "include" }),
          fetch("/api/users", { credentials: "include" }),
        ]);
        if (!meRes.ok) throw new Error("获取当前用户失败");
        if (!usersRes.ok) throw new Error("获取用户列表失败");

        const meData = await meRes.json();
        const usersData = await usersRes.json();

        setCurrentUserUid(meData.user.uid);
        setAllUsers(usersData.users);

        // 确保自己在作者中（如果接口没返回，也可以加）
        if (
          meData.user.uid &&
          !postData.authors.some(
            (a: { user: User }) => a.user.uid === meData.user.uid
          )
        ) {
          setSelectedAuthors((prev) => [...prev, meData.user.uid]);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(err instanceof Error ? err.message : "加载失败");
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPostAndUsers();
  }, [postId]);

  // 添加作者，防止重复和添加自己（自己已默认且不可删）
  const handleAddAuthor = (uid: number) => {
    if (uid === currentUserUid) return;
    if (selectedAuthors.includes(uid)) return;
    setSelectedAuthors([...selectedAuthors, uid]);
  };

  // 移除作者（不可移除自己）
  const handleRemoveAuthor = (uid: number) => {
    if (uid === currentUserUid) return;
    setSelectedAuthors(selectedAuthors.filter((id) => id !== uid));
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

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
          authors: selectedAuthors,
          tags: selectedTags,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        const msg = data?.error || "保存失败，请重试";
        throw new Error(msg);
      }
      router.push("/dashboard/post");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存失败，请重试";
      setErrorMessage(msg);
      setShowErrorDialog(true);
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
                  onClick={() => router.push(`/dashboard/post/${post?.id}`)}
                >
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
                    placeholder="请输入标题"
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

                {/* 作者选择 */}
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">作者</label>
                  <p className="mb-2 text-sm text-gray-500">
                    多作者文章可添加多个作者，自己为必选且不可移除
                  </p>

                  <Select
                    onValueChange={(val) => {
                      if (!val) return;
                      const uid = Number(val);
                      handleAddAuthor(uid);
                    }}
                    value=""
                  >
                    <SelectTrigger
                      className="w-[200px]"
                      aria-label="选择作者添加"
                    >
                      <SelectValue placeholder="添加作者" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {allUsers
                          .filter(
                            (u) =>
                              u.uid !== currentUserUid &&
                              !selectedAuthors.includes(u.uid)
                          )
                          .map((user) => (
                            <SelectItem
                              key={user.uid}
                              value={user.uid.toString()}
                            >
                              {user.id} ({user.email})
                            </SelectItem>
                          ))}
                        {allUsers.filter(
                          (u) =>
                            u.uid !== currentUserUid &&
                            !selectedAuthors.includes(u.uid)
                        ).length === 0 && (
                          <div className="p-1 text-sm text-gray-500">
                            无更多作者可添加
                          </div>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* 已选作者显示 */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAuthors.map((uid) => {
                      const user = allUsers.find((u) => u.uid === uid);
                      if (!user) return null;
                      const isSelf = uid === currentUserUid;
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
                              className="ml-1 hover:text-red-600"
                              onClick={() => handleRemoveAuthor(uid)}
                              aria-label={`删除作者 ${user.email}`}
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 标签输入与显示 */}
                <div className="mb-4">
                  <label htmlFor="tags" className="block mb-1 font-semibold">
                    标签（可选）
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="输入标签后点击添加"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      disabled={saving}
                      className="w-[200px]"
                    />
                    <Button
                      onClick={handleAddTag}
                      type="button"
                      disabled={saving}
                    >
                      添加
                    </Button>
                  </div>

                  {/* 标签输入 */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTags.length === 0 ? (
                      <div className="text-sm text-gray-400">
                        暂无标签，可添加标签
                      </div>
                    ) : (
                      selectedTags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm border bg-green-100 text-green-700 border-green-300"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                            aria-label="移除标签"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
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

                <PostContentEditor
                  content={content}
                  setContent={setContent}
                  textareaRef={textareaRef}
                  saving={saving}
                  placeholder="请输入内容"
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
