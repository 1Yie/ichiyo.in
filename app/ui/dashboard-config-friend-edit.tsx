"use client";

import { useEffect, useState } from "react";
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
import { ImageUrlWithPreview } from "@/ui/ImageUrlWithPreview";
import { CircleX } from "lucide-react";

interface SocialLink {
  id?: number;
  name: string;
  link: string;
  iconLight: string;
  iconDark: string;
}

interface DashboardConfigFriendEditProps {
  id: number;
}

export default function DashboardConfigFriendEdit({ id }: DashboardConfigFriendEditProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [pinned, setPinned] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchFriend() {
      setLoading(true);
      try {
        const res = await fetch(`/api/friend/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("获取好友信息失败");
        const data = await res.json();
        setName(data.name || "");
        setImage(data.image || "");
        setDescription(data.description || "");
        setPinned(!!data.pinned);
        setSocialLinks(
          (data.socialLinks || []).map((link: Partial<SocialLink>) => ({
            id: link.id,
            name: link.name || "",
            link: link.link || "",
            iconLight: link.iconLight || "",
            iconDark: link.iconDark || "",
          }))
        );
      } catch (error) {
        console.error(error);
        setErrorMessage("加载失败，请稍后再试");
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    }
    fetchFriend();
  }, [id]);

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
      const res = await fetch(`/api/friend/${id}`, {
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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "保存失败，请重试");
      }
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
              <BreadcrumbItem>编辑友链</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full min-w-0">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            <h1 className="text-2xl font-bold mb-4">编辑友链 #{id}</h1>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-1 font-semibold">名称</label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入名称"
                  />
                )}
              </div>

              <ImageUrlWithPreview
                labelName="图标 URL"
                labelClassName="block mb-1 font-semibold"
                src={image}
                setSrc={setImage}
                loading={loading}
              />

              <div>
                <label className="block mb-2 font-semibold">社交地址</label>

                {loading ? (
                  <>
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="mb-3 border border-gray-300 rounded-lg p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <Skeleton className="h-8 w-full rounded-md" />
                          <Skeleton className="h-8 w-full rounded-md" />
                          <Skeleton className="h-8 w-full rounded-md" />
                          <Skeleton className="h-8 w-full rounded-md" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block mb-1 font-semibold">介绍</label>
                {loading ? (
                  <Skeleton className="h-20 w-full rounded-md" />
                ) : (
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="请输入介绍"
                    className="w-full rounded-md border border-gray-300 p-2 resize-y min-h-[80px]"
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                {loading ? (
                  <Skeleton className="h-6 w-6 rounded" />
                ) : (
                  <>
                    <input
                      type="checkbox"
                      id="pinned"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="pinned" className="select-none cursor-pointer">
                      置顶
                    </label>
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-start">
                <Button onClick={handleSave} disabled={saving || loading}>
                  {saving ? "保存中..." : "保存"}
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard/config/link")} disabled={saving || loading}>
                  取消
                </Button>
              </div>
            </div>
          </div>
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
    </SidebarInset>
  );
}
