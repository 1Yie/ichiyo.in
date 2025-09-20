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
import { toast } from "sonner";
import { request } from "@/hooks/use-request";
import DashboardLayout from "@/app/ui/dashboard-layout";

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
      const res = await request(`/api/project`, {
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
      if (!res) {
        toast.error("创建失败，请重试");
        throw new Error("创建失败，请重试");
      }
      toast.success("创建成功");
      router.push("/dashboard/config/work");
    } catch (err) {
      toast.error("创建失败，请重试", {
        description:
          err instanceof Error ? err.message : "创建失败，请稍后再试",
      });
      const msg = err instanceof Error ? err.message : "创建失败，请稍后再试";
      setErrorMessage(msg);
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "配置", href: "/dashboard/config" },
        { label: "作品", href: "/dashboard/config/work" },
        { label: "新建作品", href: "/dashboard/config/work/new" },
      ]}
    >
      <h1 className="text-2xl font-bold mb-4 text-foreground/90">新建作品</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-foreground/90">
            名称
          </label>
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
          <label className="block mb-1 font-semibold text-foreground/90">
            描述
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-foreground/90">
            链接 URL
          </label>
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
    </DashboardLayout>
  );
}
