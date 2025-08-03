"use client";

import { Suspense, use } from "react";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ImageUrlWithPreview } from "@/app/ui/image-url-with-preview";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { request } from "@/hooks/use-request";
import ErrorBoundary from "@/ui/error-boundary";
import type { Pic } from "@/types/config";
import { toast } from "sonner";


interface DashboardConfigPicEditProps {
  id: number;
}

async function fetchPic(id: number): Promise<Pic> {
  const res = await request<Pic>(`/api/pic/${id}`, { credentials: "include" });
  if (!res) throw new Error("获取图片失败");
  const data = res;
  data.src = data.src?.trim() || "";
  data.title = data.title || "";
  data.button = data.button || "";
  data.link = data.link || "";
  data.newTab = !!data.newTab;
  return data;
}

function PicEditForm({ picPromise, id }: { picPromise: Promise<Pic>; id: number }) {
  const router = useRouter();
  const pic = use(picPromise);

  const [title, setTitle] = useState(pic.title);
  const [src, setSrc] = useState(pic.src);
  const [button, setButton] = useState(pic.button || "");
  const [link, setLink] = useState(pic.link || "");
  const [newTab, setNewTab] = useState(!!pic.newTab);

  const [saving, setSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    try {
      const res = await request<Pic>(`/api/pic/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          src: src.trim(),
          button: button.trim() === "" ? null : button.trim(),
          link: link.trim() === "" ? null : link.trim(),
          newTab,
        }),
      });
      if (!res) {
        toast.error("保存失败，请重试");
        throw new Error("保存失败，请重试");
      }
      toast.success("保存成功");
      router.push("/dashboard/config/pic");
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
      <h1 className="text-2xl font-bold mb-4 text-foreground/90">编辑图片 #{id}</h1>

      <div>
        <label htmlFor="title" className="block mb-1 font-semibold text-foreground/90">
          标题
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入标题"
        />
      </div>

      <ImageUrlWithPreview
        labelName="图片 URL"
        labelClassName="block mb-1 font-semibold text-foreground/90"
        src={src}
        setSrc={setSrc}
        loading={false}
      />

      <div>
        <label htmlFor="button" className="block mb-1 font-semibold text-foreground/90">
          按钮文字 (留空则不开启按钮)
        </label>
        <Input
          id="button"
          value={button}
          onChange={(e) => setButton(e.target.value)}
          placeholder="按钮显示的文字"
        />
      </div>

      <div>
        <label htmlFor="link" className="block mb-1 font-semibold text-foreground/90">
          链接 URL (按钮跳转链接)
        </label>
        <Input
          id="link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="点击按钮跳转的链接"
          disabled={button.trim() === ""}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="newTab"
          checked={newTab}
          onCheckedChange={(checked) => setNewTab(!!checked)}
          disabled={button.trim() === ""}
        />
        <label
          htmlFor="newTab"
          className={`select-none ${button.trim() === "" ? "opacity-50 cursor-not-allowed" : ""} text-foreground/90`}
        >
          是否新标签页打开链接
        </label>
      </div>

      <div className="flex gap-2 justify-start">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/config/pic")} disabled={saving}>
          取消
        </Button>
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

export default function DashboardConfigPicEdit({ id }: DashboardConfigPicEditProps) {
  const picPromise = fetchPic(id);
  const router = useRouter();

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4 bg-foreground/30" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard")}>仪表盘</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground/80" />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard/config/pic")}>图片</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground/80" />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push(`/dashboard/config/pic/${id}`)}>编辑图片 #{id}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 dark:bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white dark:bg-muted/50 rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            <div className="space-y-4">
              <Suspense
                fallback={
                  <>
                    <Skeleton className="h-10 w-24 rounded-md mb-4" />
                    <div className="space-y-4">
                      <Skeleton className="h-5 w-24 rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />

                      <ImageUrlWithPreview
                        labelName="图标 URL"
                        labelClassName="block mb-1 font-semibold"
                        src={""}
                        setSrc={() => { }}
                        loading={true}
                      />

                      <Skeleton className="h-5 w-48 rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />

                      <Skeleton className="h-5 w-48 rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />

                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-5 w-40 rounded-md" />
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
                  <PicEditForm picPromise={picPromise} id={id} />
                </ErrorBoundary>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
