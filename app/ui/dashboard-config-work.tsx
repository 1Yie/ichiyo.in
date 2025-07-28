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
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  description: string;
  link: string;
  iconLight: string;
  iconDark: string;
}

type SortField = "id" | "name" | "description" | "link";
type SortOrder = "asc" | "desc";

export default function DashboardConfigWork() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/project", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("获取作品失败");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.projects ?? []);
    } catch (err) {
      console.error(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await fetch(`/api/project/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
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

  const sortedProjects = useMemo(() => {
    if (!projects) return [];
    return [...projects].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (sortField === "id") {
        return sortOrder === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [projects, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    const isActive = field === sortField;
    return (
      <>
        <ArrowUp
          className={cn(
            "inline-block h-4 w-4",
            isActive && sortOrder === "asc"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        />
        <ArrowDown
          className={cn(
            "inline-block h-4 w-4",
            isActive && sortOrder === "desc"
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        />
      </>
    );
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
                <BreadcrumbLink
                  onClick={() => router.push("/dashboard/config/work")}
                >
                  作品
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="w-full h-full bg-white dark:bg-muted/50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4 ml-2 mr-2">
              <h1 className="text-2xl font-bold text-foreground/90">作品列表</h1>
              <Button onClick={() => router.push("/dashboard/config/work/new")}>
                <Pencil className="mr-1 h-4 w-4" />
                新建作品
              </Button>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none text-foreground/90"
                      onClick={() => handleSort("id")}
                    >
                      ID {renderSortIcon("id")}
                    </TableHead>
                    <TableHead className="text-foreground/90">图标</TableHead>
                    <TableHead className="text-foreground/90">名称</TableHead>
                    <TableHead className="text-foreground/90">描述</TableHead>
                    <TableHead className="text-foreground/90">链接</TableHead>
                    <TableHead className="text-right text-foreground/90">
                      操作
                    </TableHead>
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
                          <Skeleton className="h-8 w-8 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 inline-block" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : sortedProjects.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        暂无作品
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="text-foreground/90">{project.id}</TableCell>
                        <TableCell>
                          <Image
                            src={project.iconLight}
                            alt="icon light"
                            width={32}
                            height={32}
                            className="h-12 w-auto rounded dark:hidden"
                            unoptimized
                            priority
                          />
                          <Image
                            src={project.iconDark}
                            alt="icon dark"
                            width={32}
                            height={32}
                            className="hidden h-12 w-auto rounded dark:inline"
                            unoptimized
                            priority
                          />
                        </TableCell>
                        <TableCell className="text-foreground/90">{project.name}</TableCell>
                        <TableCell className="text-foreground/90">{project.description}</TableCell>
                        <TableCell>
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-foreground/90"
                          >
                            {project.link}
                          </a>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/dashboard/config/work/${project.id}`)
                            }
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteId(project.id);
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
            <AlertDialogTitle>确定要删除这条作品？</AlertDialogTitle>
            <AlertDialogDescription>删除后将无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
