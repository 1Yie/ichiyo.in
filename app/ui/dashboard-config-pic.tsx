"use client";

import { useEffect, useState, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface Pic {
  id: number;
  title: string;
  src: string;
  button?: string | null;
  link?: string | null;
  newTab?: boolean;
}

type SortField = "id" | "title" | "button" | "link" | "none";
type SortOrder = "asc" | "desc";

export default function DashboardConfigPic() {
  const router = useRouter();

  const [pics, setPics] = useState<Pic[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const fetchPics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pic", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("获取图片失败");
      const data = await res.json();
      setPics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPics();
  }, []);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedPics = useMemo(() => {
    if (!pics) return [];
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
            isActive && sortOrder === "asc" ? "text-black" : "text-gray-300"
          )}
        />
        <ArrowDown
          className={cn(
            "inline-block h-4 w-4",
            isActive && sortOrder === "desc" ? "text-black" : "text-gray-300"
          )}
        />
      </>
    );
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await fetch(`/api/pic/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("删除失败");
      fetchPics();
    } catch (err) {
      console.error(err);
      // 这里可以扩展提示删除失败
    } finally {
      setShowDeleteDialog(false);
      setDeleteId(null);
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
                  onClick={() => router.push("/dashboard/config/pic")}
                >
                  图片
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="bg-muted/50 flex-1 rounded-xl p-4">
          <div className="w-full h-full bg-white p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4 ml-2 mr-2">
              <h1 className="text-2xl font-bold">图片列表</h1>
              <Button onClick={() => router.push("/dashboard/config/pic/new")}>
                <Pencil className="mr-1 h-4 w-4" />
                新建图片
              </Button>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("id")}
                    >
                      ID {renderSortIcon("id")}
                    </TableHead>
                    <TableHead>预览</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("title")}
                    >
                      标题
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("button")}
                    >
                      按钮文字
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("link")}
                    >
                      链接
                    </TableHead>
                    <TableHead>标签</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-6" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-12 w-20 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 inline-block" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : pics && pics.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        暂无图片
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedPics.map((pic) => (
                      <TableRow key={pic.id}>
                        <TableCell>{pic.id}</TableCell>
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
                        <TableCell>{pic.title}</TableCell>
                        <TableCell>{pic.button ?? "未开启"}</TableCell>
                        <TableCell>
                          {pic.link ? (
                            <a
                              href={pic.link}
                              target={pic.newTab ? "_blank" : "_self"}
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {pic.link}
                            </a>
                          ) : (
                            "未开启"
                          )}
                        </TableCell>
                        <TableCell>
                          {pic.button === null
                            ? "未开启"
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
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除这张图片？</AlertDialogTitle>
            <AlertDialogDescription>删除后将无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
