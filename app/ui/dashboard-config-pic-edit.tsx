"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ImageUrlWithPreview } from "@/ui/ImageUrlWithPreview";

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

interface Pic {
  id: number;
  title: string;
  src: string;
  button?: string | null;
  link?: string | null;
  newTab?: boolean | null;
}

interface DashboardConfigPicEditProps {
  id: number;
}

export default function DashboardConfigPicEdit({
  id,
}: DashboardConfigPicEditProps) {
  const router = useRouter();

  const [, setPic] = useState<Pic | null>(null);
  const [title, setTitle] = useState("");
  const [src, setSrc] = useState("");
  const [button, setButton] = useState("");
  const [link, setLink] = useState("");
  const [newTab, setNewTab] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchPic() {
      setLoading(true);
      try {
        const res = await fetch(`/api/pic/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("获取图片失败");
        const data = await res.json();
        setPic(data);
        setTitle(data.title || "");
        setSrc(data.src || "");
        setButton(data.button || "");
        setLink(data.link || "");
        setNewTab(!!data.newTab);
      } catch (error) {
        console.error(error);
        setErrorMessage("加载失败，请稍后再试");
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPic();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/pic/${id}`, {
        method: "PATCH",
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
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "保存失败，请稍后再试";
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
                <BreadcrumbLink
                  onClick={() => router.push("/dashboard/config/pic")}
                >
                  图片
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink
                  onClick={() => router.push(`/dashboard/config/pic/${id}`)}
                >
                  编辑图片
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            <h1 className="text-2xl font-bold mb-4">编辑图片 #{id}</h1>

            <div className="space-y-4">
              {/* 标题 */}
              <div>
                <label className="block mb-1 font-semibold" htmlFor="title">
                  标题
                </label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="请输入标题"
                  />
                )}
              </div>

              {/* 图片 URL */}
              {/* <div>
                <label className="block mb-1 font-semibold" htmlFor="src">
                  图片 URL
                </label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    id="src"
                    value={src}
                    onChange={(e) => setSrc(e.target.value)}
                    placeholder="请输入图片地址"
                  />
                )}
              </div> */}
              <ImageUrlWithPreview
                labelName="图片 URL"
                labelClassName="block mb-1 font-semibold"
                src={src}
                setSrc={setSrc}
              />
              {/* 按钮文字 */}
              <div>
                <label className="block mb-1 font-semibold" htmlFor="button">
                  按钮文字 (留空则不开启按钮)
                </label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    id="button"
                    value={button}
                    onChange={(e) => setButton(e.target.value)}
                    placeholder="按钮显示的文字"
                  />
                )}
              </div>

              {/* 链接 URL */}
              <div>
                <label className="block mb-1 font-semibold" htmlFor="link">
                  链接 URL (按钮跳转链接)
                </label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    id="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="点击按钮跳转的链接"
                    disabled={button.trim() === ""}
                  />
                )}
              </div>

              {/* 是否新标签页 */}
              <div className="flex items-center space-x-2">
                {loading ? (
                  <Skeleton className="h-6 w-6 rounded" />
                ) : (
                  <>
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
                        button.trim() === ""
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      是否新标签页打开链接
                    </label>
                  </>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 justify-start">
                <Button onClick={handleSave} disabled={saving || loading}>
                  {saving ? "保存中..." : "保存"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/config/pic")}
                  disabled={saving || loading}
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
