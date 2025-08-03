"use client";

import { Suspense, use } from "react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ImageUrlWithPreview } from "@/app/ui/image-url-with-preview";
import { CircleX } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { request } from "@/hooks/use-request";
import type { Friend, SocialLink } from "@/types/config";
import ErrorBoundary from "@/ui/error-boundary";

interface DashboardConfigFriendEditProps {
  id: number;
}

async function fetchFriendData(id: number): Promise<Friend> {
  return request<Friend>(`/api/friend/${id}`, {
    method: "GET",
    credentials: "include",
  });
}

function FriendForm({ friendPromise, id }: { friendPromise: Promise<Friend>; id: number }) {
  const router = useRouter();
  const friend = use(friendPromise);

  const [name, setName] = useState(friend.name);
  const [image, setImage] = useState(friend.image || "");
  const [description, setDescription] = useState(friend.description || "");
  const [pinned, setPinned] = useState(!!friend.pinned);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(friend.socialLinks || []);

  const [saving, setSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateSocialLink(index: number, field: keyof SocialLink, value: string) {
    setSocialLinks((prev) => {
      const newLinks = [...prev];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return newLinks;
    });
  }

  function addSocialLink() {
    setSocialLinks((prev) => [
      ...prev,
      { name: "", link: "", iconLight: "", iconDark: "" },
    ]);
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await request<Friend>(`/api/friend/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          image: image.trim(),
          description: description.trim(),
          pinned,
          socialLinks: socialLinks.map((link) => ({
            name: link.name.trim(),
            link: link.link.trim(),
            iconLight: link.iconLight.trim(),
            iconDark: link.iconDark.trim(),
          })),
        }),
      });
      if (!res) {
        toast.error("保存失败，请重试");
        throw new Error("保存失败，请重试");
      }
      toast.success("保存成功");
      router.push("/dashboard/config/link");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "保存失败，请稍后再试";
      setErrorMessage(msg);
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 font-semibold">名称</label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入名称"
          />
        </div>

        <ImageUrlWithPreview
          labelName="图标 URL"
          labelClassName="block mb-1 font-semibold"
          src={image}
          setSrc={setImage}
          loading={false}
        />

        <div>
          <label className="block mb-2 font-semibold">社交地址</label>
          {socialLinks.map((link, index) => (
            <div key={index} className="mb-3 border border-gray-300 rounded-lg p-3 relative">
              {socialLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-2xl font-bold leading-none"
                  aria-label="删除社交地址"
                >
                  <CircleX />
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">社交平台名称</label>
                  <Input
                    value={link.name}
                    onChange={(e) => updateSocialLink(index, "name", e.target.value)}
                    placeholder="例如微博"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">链接 URL</label>
                  <Input
                    value={link.link}
                    onChange={(e) => updateSocialLink(index, "link", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">浅色 Icon URL</label>
                  <Input
                    value={link.iconLight}
                    onChange={(e) => updateSocialLink(index, "iconLight", e.target.value)}
                    placeholder="浅色图标链接"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">深色 Icon URL</label>
                  <Input
                    value={link.iconDark}
                    onChange={(e) => updateSocialLink(index, "iconDark", e.target.value)}
                    placeholder="深色图标链接"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSocialLink} size="sm">
            + 添加社交地址
          </Button>
        </div>

        <div>
          <label htmlFor="description" className="block mb-1 font-semibold">介绍</label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请输入介绍"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pinned"
            checked={pinned}
            onCheckedChange={(checked) => setPinned(!!checked)}
          />
          <label htmlFor="pinned" className="select-none cursor-pointer">
            置顶
          </label>
        </div>

        <div className="flex gap-2 justify-start">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/config/link")} disabled={saving}>
            取消
          </Button>
        </div>
      </div>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>保存失败</AlertDialogTitle>
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

export default function DashboardConfigFriendEdit({ id }: DashboardConfigFriendEditProps) {
  const friendPromise = fetchFriendData(id);
  const router = useRouter();

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard")}>仪表盘</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard/config/link")}>友链</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push(`/dashboard/config/link/${id}`)}>编辑友链 #{id}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 dark:bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white dark:bg-muted/50 rounded-xl p-4 h-full w-full min-w-0 flex flex-col">

            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-5 w-18" />
                  <Skeleton className="h-10 w-full" />

                  <ImageUrlWithPreview
                    labelName="图标 URL"
                    labelClassName="block mb-1 font-semibold"
                    src={""}
                    setSrc={() => { }}
                    loading={true}
                  />

                  {[...Array(1)].map((_, i) => (
                    <div key={`skeleton-${i}`}>
                      <div className="mb-3 border border-gray-300 rounded-lg p-3 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <Skeleton className="h-5 w-18 mb-2" />
                            <Skeleton className="h-8 flex-1 rounded-md" />
                          </div>
                          <div>
                            <Skeleton className="h-5 w-18 mb-2" />
                            <Skeleton className="h-8 flex-1 rounded-md" />
                          </div>
                          <div>
                            <Skeleton className="h-5 w-18 mb-2" />
                            <Skeleton className="h-8 flex-1 rounded-md" />
                          </div>
                          <div>
                            <Skeleton className="h-5 w-18 mb-2" />
                            <Skeleton className="h-8 flex-1 rounded-md" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  ))}

                  <Skeleton className="h-5 w-18" />
                  <Skeleton className="h-24 w-full rounded-md" />

                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>

                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-24 rounded-md" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                  </div>

                </div>
              }
            >
              <ErrorBoundary fallback={null}>
                <FriendForm friendPromise={friendPromise} id={id} />
              </ErrorBoundary>
            </Suspense>

          </div>
        </div>
      </div>
    </SidebarInset>

  );
}