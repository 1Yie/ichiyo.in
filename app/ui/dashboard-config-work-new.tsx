"use client";

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

export default function DashboardCreateProject() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [iconLight, setIconLight] = useState("");
  const [iconDark, setIconDark] = useState("");

  const [saving, setSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          link,
          iconLight,
          iconDark,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "创建失败，请重试");
      }
      router.push("/dashboard/config/work");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "创建失败，请稍后再试";
      setErrorMessage(msg);
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 bg-foreground/30"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard")}>
                  仪表盘
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground/80" />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard/config/work")}>
                  作品
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground/80" />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard/config/work/new")}>
                  新建作品
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 dark:bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white dark:bg-muted/50 rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            <h1 className="text-2xl font-bold mb-4 text-foreground/90">新建作品</h1>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold text-foreground/90">名称</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <ImageUrlWithPreview
                src={iconLight}
                setSrc={setIconLight}
                labelName="图标 URL（浅色）"
                labelClassName="block mb-1 font-semibold text-foreground/90"
              />

              <ImageUrlWithPreview
                src={iconDark}
                setSrc={setIconDark}
                labelName="图标 URL（深色）"
                labelClassName="block mb-1 font-semibold text-foreground/90"
              />

              <div>
                <label className="block mb-1 font-semibold text-foreground/90">描述</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-foreground/90">链接 URL</label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "创建中..." : "创建"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/config/work")}
                  disabled={saving}
                >
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
            <AlertDialogTitle>创建失败</AlertDialogTitle>
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
