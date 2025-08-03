"use client";

import { Suspense, use, useState } from "react";
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
import { request } from "@/hooks/use-request";
import ErrorBoundary from "@/ui/error-boundary";
import { toast } from "sonner";
import type { Project } from "@/types/config";

interface DashboardEditProjectProps {
  projectId: number;
}

async function fetchProject(id: number): Promise<Project> {
  const res = await request<Project>(`/api/project/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res) {
    toast.error("获取作品失败");
    throw new Error("获取作品失败");
  }
  const data = res;
  return data;
}

function ProjectEditForm({ projectPromise, projectId }: { projectPromise: Promise<Project>; projectId: number }) {
  const router = useRouter();
  const project = use(projectPromise);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [link, setLink] = useState(project.link);
  const [iconLight, setIconLight] = useState(project.iconLight);
  const [iconDark, setIconDark] = useState(project.iconDark);

  const [saving, setSaving] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await request<Project>(`/api/project/${projectId}`, {
        method: "PATCH",
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
        toast.error("保存失败，请重试");
        throw new Error("保存失败，请重试");
      }
      toast.success("保存成功");
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
    <>
      <h1 className="text-2xl font-bold mb-4 text-foreground/90">编辑作品 #{projectId}</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-foreground/90">名称</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <ImageUrlWithPreview
          labelName="图标 URL（浅色）"
          labelClassName="block mb-1 font-semibold text-foreground/90"
          src={iconLight}
          setSrc={setIconLight}
          loading={false}
        />

        <ImageUrlWithPreview
          labelName="图标 URL（深色）"
          labelClassName="block mb-1 font-semibold text-foreground/90"
          src={iconDark}
          setSrc={setIconDark}
          loading={false}
        />

        <div>
          <label className="block mb-1 font-semibold text-foreground/90">描述</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-foreground/90">链接 URL</label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
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

export default function DashboardEditProjectSuspenseWrapper({ projectId }: DashboardEditProjectProps) {
  const router = useRouter();
  const project = fetchProject(projectId);

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
                <BreadcrumbLink onClick={() => router.push("/dashboard")}>仪表盘</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground/80" />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard/config/work")}>作品</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-foreground/80" />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push(`/dashboard/config/work/${projectId}`)}>
                  编辑作品 #{projectId}
                </BreadcrumbLink>
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
                <>
                  <Skeleton className="h-10 w-24 rounded-md mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />

                    <ImageUrlWithPreview
                      labelName="图标 URL（浅色）"
                      labelClassName="block mb-1 font-semibold"
                      src={""}
                      setSrc={() => { }}
                      loading={true}
                    />

                    <ImageUrlWithPreview
                      labelName="图标 URL（深色）"
                      labelClassName="block mb-1 font-semibold"
                      src={""}
                      setSrc={() => { }}
                      loading={true}
                    />

                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />

                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />

                    <div className="flex gap-4">
                      <Skeleton className="h-10 w-24 rounded-md" />
                      <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                  </div>
                </>
              }
            >
              <ErrorBoundary fallback={null}>
                <ProjectEditForm projectPromise={project} projectId={projectId} />
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
