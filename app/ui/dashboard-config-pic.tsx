"use client";

import { Suspense, use } from "react";
import { useState, useMemo } from "react";
import { useRouter } from "nextjs-toploader/app";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowUp, ArrowDown } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { request } from "@/hooks/use-request";
import type { Pic } from "@/types/config";
import DashboardLayout from "@/app/ui/dashboard-layout";

type SortField = "id" | "title" | "button" | "link" | "none";
type SortOrder = "asc" | "desc";

async function fetchPicsData(): Promise<Pic[]> {
  const res = await request("/api/pic", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res) throw new Error("获取图片失败");
  const data = res;
  return Array.isArray(data) ? data : [];
}

function PicList({ picsPromise }: { picsPromise: Promise<Pic[]> }) {
  const initialPics = use(picsPromise);
  const [pics, setPics] = useState(initialPics);

  const router = useRouter();

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      const res = await request(`/api/pic/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      if (!res) throw new Error("删除失败");

      setPics((prev) => prev.filter((pic) => pic.id !== deleteId));

      toast.success(`ID 为 ${deleteId} 的图片已被删除`);
    } catch (err) {
      console.error(err);
      toast.error("服务器未能成功响应删除请求");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedPics = useMemo(() => {
    if (sortField === "none") return pics;

    return [...pics].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [pics, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    const isActive = field === sortField;
    return (
      <>
        <ArrowUp
          className={cn(
            "inline-block h-4 w-4",
            isActive && sortOrder === "asc"
              ? "text-foreground/90"
              : "text-gray-300"
          )}
        />
        <ArrowDown
          className={cn(
            "inline-block h-4 w-4",
            isActive && sortOrder === "desc"
              ? "text-foreground/90"
              : "text-gray-300"
          )}
        />
      </>
    );
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer select-none text-foreground/90"
              onClick={() => handleSort("id")}
            >
              ID {renderSortIcon("id")}
            </TableHead>
            <TableHead className="text-foreground/90">预览</TableHead>
            <TableHead
              className="cursor-pointer select-none text-foreground/90"
              onClick={() => handleSort("title")}
            >
              标题 {renderSortIcon("title")}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none text-foreground/90"
              onClick={() => handleSort("button")}
            >
              按钮文字 {renderSortIcon("button")}
            </TableHead>
            <TableHead
              className="cursor-pointer select-none text-foreground/90"
              onClick={() => handleSort("link")}
            >
              链接 {renderSortIcon("link")}
            </TableHead>
            <TableHead className="text-foreground/90">打开方式</TableHead>
            <TableHead className="text-right text-foreground/90">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPics.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground dark:text-muted"
              >
                暂无图片
              </TableCell>
            </TableRow>
          ) : (
            sortedPics.map((pic) => (
              <TableRow key={pic.id}>
                <TableCell className="text-foreground/90">{pic.id}</TableCell>
                <TableCell>
                  <Image
                    src={pic.src}
                    alt={pic.title}
                    width={80}
                    height={48}
                    className="h-20 object-cover w-auto rounded"
                    unoptimized
                    priority
                  />
                </TableCell>
                <TableCell className="text-foreground/90">
                  {pic.title}
                </TableCell>
                <TableCell className="text-foreground/90">
                  {pic.button ?? "-"}
                </TableCell>
                <TableCell className="text-foreground/90">
                  {pic.link ? (
                    <a
                      href={pic.link}
                      target={pic.newTab ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {pic.link}
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-foreground/90">
                  {pic.button === null
                    ? "-"
                    : pic.newTab
                    ? "新标签"
                    : "当前标签"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/config/pic/${pic.id}`)
                    }
                  >
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeleteId(pic.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除这张图片？</AlertDialogTitle>
            <AlertDialogDescription>删除后将无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function DashboardConfigPicSuspenseWrapper() {
  const picsPromise = fetchPicsData();
  const router = useRouter();

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "配置", href: "/dashboard/config" },
        { label: "图片", href: "/dashboard/config/pic" },
      ]}
    >
      <div className="flex items-center justify-between mb-4 ml-2 mr-2">
        <h1 className="text-2xl font-bold text-foreground/90">图片列表</h1>
        <Button onClick={() => router.push("/dashboard/config/pic/new")}>
          <Pencil className="mr-1 h-4 w-4" />
          新建图片
        </Button>
      </div>

      <div className="rounded-xl bg-muted/50 dark:bg-muted/50 p-4">
        <Suspense
          fallback={
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer select-none text-foreground/90">
                    ID
                  </TableHead>
                  <TableHead className="text-foreground/90">预览</TableHead>
                  <TableHead className="text-foreground/90">标题</TableHead>
                  <TableHead className="text-foreground/90">按钮文字</TableHead>
                  <TableHead className="text-foreground/90">链接</TableHead>
                  <TableHead className="text-foreground/90">打开方式</TableHead>
                  <TableHead className="text-right text-foreground/90">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-6 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-20 w-32 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded" />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Skeleton className="inline-block h-8 w-12 rounded" />
                      <Skeleton className="inline-block h-8 w-12 rounded" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          }
        >
          <PicList picsPromise={picsPromise} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
