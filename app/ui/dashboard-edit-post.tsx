"use client";

import { Suspense, use, useState, useRef } from "react";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";

import { FontStyleToggleGroup } from "@/ui/font-style-toggle-group";
import { PostContentEditor } from "@/ui/post-content-editor";
import { request } from "@/hooks/use-request";
import ErrorBoundary from "@/ui/error-boundary";
import { toast } from "sonner";

import type { PostT, PostData } from "@/types/post";
import type { User } from "@/types/auth";


async function fetchPostData(postId: number): Promise<PostData> {
  try {
    const [postRes, meRes, usersRes] = await Promise.all([
      request<PostT>(`/api/post/byId/${postId}`, {
        credentials: "include",
        cache: "no-store"
      }),
      request<{ authenticated: boolean; user: User }>(`/api/me`, {
        credentials: "include",
        cache: "no-store"
      }),
      request<{ users: User[] }>(`/api/users`, {
        credentials: "include",
        cache: "no-store"
      }),
    ]);

    // 验证文章数据
    if (!postRes?.id) {
      toast.error("文章数据不完整或不存在");
      throw new Error("文章数据不完整或不存在");
    }

    // 验证当前用户数据
    if (!meRes?.authenticated || !meRes.user?.uid) {
      toast.error("未获取到有效的用户信息，请重新登录");
      throw new Error("未获取到有效的用户信息，请重新登录");
    }

    // 验证用户列表数据
    if (!usersRes?.users || !Array.isArray(usersRes.users)) {
      toast.error("用户列表数据格式不正确");
      throw new Error("用户列表数据格式不正确");
    }
    return {
      post: postRes,
      me: meRes.user,
      users: usersRes.users,
    };
  } catch (error) {
    toast.error("获取文章数据时出错", {
      description: error instanceof Error ? error.message : "未知错误"
    });
    console.error("获取文章数据时出错:", error);
    throw new Error(
      `加载失败: ${error instanceof Error ? error.message : "未知错误"}`,
      { cause: error }
    );
  }
}

function DashboardEditPostInner({
  postData,
  postId,
}: {
  postData: Promise<PostData>;
  postId: number;
}) {
  const router = useRouter();

  const { post, me, users } = use(postData);

  // 状态初始化
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug || "");
  const [content, setContent] = useState(post.content);
  const [published, setPublished] = useState(post.published);
  const [saving, setSaving] = useState(false);

  // 作者管理，确保当前用户必选且不可删除
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>(() => {
    const authorsUid = post.authors.map((a) => a.user.uid);
    if (!authorsUid.includes(me.uid)) authorsUid.push(me.uid);
    return authorsUid;
  });

  // 标签管理
  const [selectedTags, setSelectedTags] = useState<string[]>(post.tags?.map((t) => t.name) || []);
  const [tagInput, setTagInput] = useState("");

  // 错误提示弹窗
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [headingLevel, setHeadingLevel] = useState<string>("");

  // 添加作者
  const handleAddAuthor = (uid: number) => {
    if (uid === me.uid) return;
    if (selectedAuthors.includes(uid)) return;
    setSelectedAuthors([...selectedAuthors, uid]);
  };

  // 移除作者（不可移除自己）
  const handleRemoveAuthor = (uid: number) => {
    if (uid === me.uid) return;
    setSelectedAuthors(selectedAuthors.filter((id) => id !== uid));
  };

  // 添加标签
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag]);
    }
    setTagInput("");
  };

  // 移除标签
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  // 保存接口
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await request<PostT>(`/api/post/byId/${postId}`, {
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
      if (!res) {
        toast.error("保存失败，请重试");
        throw new Error("保存失败，请重试");
      }
      toast.success("保存成功");
      router.push("/dashboard/post");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "保存失败，请重试");
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => router.push("/dashboard/post");

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 text-foreground/90">编辑文章 #{post.id}</h1>
      <div className="mb-4">
        <label htmlFor="title" className="block mb-1 font-semibold text-foreground/90">
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
        <label htmlFor="slug" className="block mb-1 font-semibold text-foreground/90">
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
      <div className="mb-4">
        <label className="block mb-1 font-semibold text-foreground/90">作者</label>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
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
          <SelectTrigger className="w-[200px]" aria-label="选择作者添加">
            <SelectValue placeholder="添加作者" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {users.length > 0 ? (
                users.map(user => (
                  <SelectItem key={user.uid} value={user.uid.toString()}>
                    {user.id} ({user.email})
                  </SelectItem>
                ))
              ) : (
                <div className="p-1 text-sm text-gray-500">
                  {users.length === 0 ? "用户列表为空" : "无更多作者可添加"}
                </div>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="mt-2 flex flex-wrap gap-2">
          {selectedAuthors.map((uid) => {
            const user = users.find((u) => u.uid === uid);
            if (!user) return null;
            const isSelf = uid === me.uid;
            return (
              <div
                key={uid}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm border ${isSelf ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-blue-100 text-blue-700 border-blue-300"
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

      <div className="mb-4">
        <label htmlFor="tags" className="block mb-1 font-semibold text-foreground/90">
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
          <Button onClick={handleAddTag} type="button" disabled={saving}>
            添加
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTags.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">暂无标签，可添加标签</div>
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

      <div className="mb-2">
        <label htmlFor="content" className="block mb-1 font-semibold text-foreground/90">
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
        <label htmlFor="published" className="text-foreground/90">
          已发布
        </label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="disabled:opacity-50">
          {saving ? "保存中..." : "保存"}
        </Button>
        <Button onClick={handleCancel} disabled={saving} className="disabled:opacity-50" variant="outline">
          取消
        </Button>
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
    </>

  );
}

export default function DashboardEditPostSuspenseWrapper({ postId }: { postId: number }) {
  const router = useRouter();
  const postDataPromise = fetchPostData(postId);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4 bg-foreground/30" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer" onClick={() => router.push("/dashboard")}>
                  仪表盘
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground/80" />
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer" onClick={() => router.push("/dashboard/post")}>
                  文章管理
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground/80" />
              <BreadcrumbItem>
                <BreadcrumbLink className="cursor-pointer" onClick={() => router.push(`/dashboard/post/${postId}`)}>
                  编辑文章 #{postId}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white dark:bg-muted/50 rounded-xl p-4 h-full w-full min-w-0 flex flex-col overflow-auto">
            <Suspense
              fallback={
                <>
                  <Skeleton className="h-10 w-24 rounded-md mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />

                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />

                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-10 w-32 rounded-md" />

                    <Skeleton className="h-5 w-24 rounded-md" />

                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-32 rounded-md" />
                      <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-1/6 rounded-md" />
                      <Skeleton className="h-10 w-1/7 rounded-md" />
                      <Skeleton className="h-10 w-1/8 rounded-md" />
                    </div>

                    <Skeleton className="h-20 w-full rounded-md" />

                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </div>

                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-24 rounded-md" />
                      <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                  </div>
                </>
              }
            >
              <ErrorBoundary fallback={null}>
                <DashboardEditPostInner postData={postDataPromise} postId={postId} />
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
