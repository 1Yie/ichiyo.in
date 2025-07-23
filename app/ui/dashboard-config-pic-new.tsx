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

export default function DashboardConfigPicNew() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [button, setButton] = useState("");
  const [link, setLink] = useState("");
  const [newTab, setNewTab] = useState(false);

  const [saving, setSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/pic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          src,
          button: button.trim() === "" ? null : button,
          link: link.trim() === "" ? null : link,
          newTab,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "保存失败，请重试");
      }
      router.push("/dashboard/config/pic");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "保存失败，请稍后再试");
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
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard")}>
                  仪表盘
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard/config/pic")}>
                  图片
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>新建图片</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            <h1 className="text-2xl font-bold mb-4">新建图片</h1>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">标题</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入标题"
                />
              </div>

              <ImageUrlWithPreview
                src={src}
                setSrc={setSrc}
                labelName="图片链接"
                labelClassName="block mb-1 font-semibold"
              />

              <div>
                <label className="block mb-1 font-semibold">按钮文字 (留空则不开启按钮)</label>
                <Input
                  value={button}
                  onChange={(e) => setButton(e.target.value)}
                  placeholder="按钮显示的文字"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">链接 URL</label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="点击按钮跳转的链接"
                  disabled={button.trim() === ""}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="newTab"
                  type="checkbox"
                  checked={newTab}
                  onChange={(e) => setNewTab(e.target.checked)}
                  disabled={button.trim() === ""}
                  className="cursor-pointer"
                />
                <label
                  htmlFor="newTab"
                  className={`select-none ${
                    button.trim() === "" ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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
