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

interface Project {
  id: number;
  name: string;
  description: string;
  link: string;
  icon: string;
}

interface DashboardEditProjectProps {
  projectId: number;
}

export default function DashboardEditProject({
  projectId,
}: DashboardEditProjectProps) {
  const router = useRouter();
  const id = projectId;
  const [, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/project/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("获取作品失败");
        const data = await res.json();
        setProject(data);
        setName(data.name);
        setDescription(data.description);
        setLink(data.link);
        setIcon(data.icon);
      } catch (err) {
        console.error(err);
        setErrorMessage("加载失败，请稍后再试");
        setShowErrorDialog(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/project/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, link, icon }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "保存失败，请重试");
      }
      router.push("/dashboard/config/work");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存失败，请稍后再试";
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
                  onClick={() => router.push("/dashboard/config/work")}
                >
                  作品
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink
                  onClick={() => router.push(`/dashboard/config/work/${id}`)}
                >
                  编辑作品
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            <h1 className="text-2xl font-bold mb-4">编辑作品 #{id}</h1>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">名称</label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
              </div>
              <ImageUrlWithPreview
                labelName="图标 URL"
                labelClassName="block mb-1 font-semibold"
                src={icon}
                setSrc={setIcon}
                loading={loading}
              />
              <div>
                <label className="block mb-1 font-semibold">描述</label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                )}
              </div>
              <div>
                <label className="block mb-1 font-semibold">链接 URL</label>
                {loading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                )}
              </div>
              <div></div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || loading}>
                  {saving ? "保存中..." : "保存"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/config/work")}
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
