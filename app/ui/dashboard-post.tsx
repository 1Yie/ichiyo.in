"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, ArrowUp, ArrowDown } from "lucide-react";

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortField = "id" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

export default function DashboardPost() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const router = useRouter();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/post", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch posts error:", res.status, errorText);
        throw new Error("获取文章失败");
      }
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (id: number) => {
    router.push(`/dashboard/post/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除这篇文章吗？")) return;
    try {
      const res = await fetch(`/api/post/byId/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("删除失败");
      alert("删除成功");
      fetchPosts();
    } catch (err) {
      alert("删除失败，请稍后重试");
      console.error(err);
    }
  };

  // 点击列头切换排序字段和顺序
  function handleSort(field: SortField) {
    if (field === sortField) {
      // 同一字段切换升降序
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 新字段默认降序
      setSortField(field);
      setSortOrder("desc");
    }
  }

  const sortedPosts = [...posts].sort((a, b) => {
    let compareA: number;
    let compareB: number;

    switch (sortField) {
      case "id":
        compareA = a.id;
        compareB = b.id;
        break;
      case "createdAt":
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
        break;
      case "updatedAt":
        compareA = new Date(a.updatedAt).getTime();
        compareB = new Date(b.updatedAt).getTime();
        break;
    }

    if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
    if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const formatBeijingTime = (utcString: string) => {
    return new Date(utcString).toLocaleString("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

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
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">仪表盘</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/post">文章管理</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="bg-muted/50 flex-1 rounded-xl p-4">
          <div className="w-full h-full bg-white p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4 ml-2 mr-2">
              <h1 className="text-2xl font-bold mb-4">文章列表</h1>
              <Button onClick={() => router.push("/dashboard/post/new")}>
                <Pencil className="mr-1 h-4 w-4" />
                新建文章
              </Button>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              {loading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">ID</TableHead>
                      <TableHead className="font-bold">标题</TableHead>
                      <TableHead className="font-bold">状态</TableHead>
                      <TableHead className="font-bold">创建时间</TableHead>
                      <TableHead className="font-bold">更新时间</TableHead>
                      <TableHead className="text-right font-bold">
                        操作
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-28 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-28 rounded" />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Skeleton className="h-8 w-16 inline-block" />
                          <Skeleton className="h-8 w-16 inline-block" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : posts.length === 0 ? (
                <p className="text-muted-foreground">暂无文章</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="font-bold cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        ID {renderSortIcon("id")}
                      </TableHead>
                      <TableHead className="font-bold">Slug</TableHead>
                      <TableHead className="font-bold">标题</TableHead>
                      <TableHead className="font-bold">状态</TableHead>
                      <TableHead
                        className="font-bold cursor-pointer"
                        onClick={() => handleSort("createdAt")}
                      >
                        创建时间 {renderSortIcon("createdAt")}
                      </TableHead>
                      <TableHead
                        className="font-bold cursor-pointer"
                        onClick={() => handleSort("updatedAt")}
                      >
                        更新时间 {renderSortIcon("updatedAt")}
                      </TableHead>
                      <TableHead className="text-right font-bold">
                        操作
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>{post.id}</TableCell>
                        <TableCell>{post.slug}</TableCell>
                        <TableCell>{post.title}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-1 rounded",
                              post.published
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-500"
                            )}
                          >
                            {post.published ? "已发布" : "未发布"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {formatBeijingTime(post.createdAt)}
                        </TableCell>
                        <TableCell>
                          {formatBeijingTime(post.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(post.id)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(post.id)}
                          >
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
