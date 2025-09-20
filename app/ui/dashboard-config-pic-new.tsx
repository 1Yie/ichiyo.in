"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
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
import { ImageUrlWithPreview } from "@/app/ui/image-url-with-preview";
import { Checkbox } from "@/components/ui/checkbox";
import { request } from "@/hooks/use-request";
import { toast } from "sonner";
import DashboardLayout from "@/app/ui/dashboard-layout";

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
      const res = await request("/api/pic", {
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
      if (!res) {
        toast.error("保存失败，请重试");
        throw new Error("保存失败，请重试");
      }
      toast.success("保存成功");
      router.push("/dashboard/config/pic");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "保存失败，请稍后再试"
      );
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout
      breadcrumbs={[
         { label: "仪表盘", href: "/dashboard" },
        { label: "图片", href: "/dashboard/config/pic" },
        { label: "新建图片", href: "/dashboard/config/pic/new" },
      ]}
    >
      <h1 className="text-2xl font-bold mb-4 text-foreground/90">新建图片</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-foreground/90">
            标题
          </label>
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
          labelClassName="block mb-1 font-semibold text-foreground/90"
        />

        <div>
          <label className="block mb-1 font-semibold text-foreground/90">
            按钮文字 (留空则不开启按钮)
          </label>
          <Input
            value={button}
            onChange={(e) => setButton(e.target.value)}
            placeholder="按钮显示的文字"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-foreground/90">
            链接 URL
          </label>
          <Input
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
            className={`select-none text-foreground/90 ${
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
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/config/pic")}
            disabled={saving}
          >
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
    </DashboardLayout>
  );
}
