"use client";

import { useEffect, useState } from "react";
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

interface Post {
  id: number;
  slug: string;
  title: string;
  content?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;

  authors: {
    user: {
      id: string;
      email: string;
      uid: number;
    };
  }[];
}

interface CurrentUser {
  uid: number;
  email: string;
  isAdmin: boolean;
}

interface PostsResponse {
  posts: Post[];
  currentUser: CurrentUser;
}

type SortField = "id" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

export default function DashboardPost() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/post?summary=true", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("获取文章失败");
      const data: PostsResponse = await res.json();
      setPosts(data.posts);
      setCurrentUser(data.currentUser);
    } catch (err) {
      console.error(err);
      setErrorMessage("获取文章失败，请稍后再试");
      setErrorDialogOpen(true);
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

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await fetch(`/api/post/byId/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("删除失败");
      fetchPosts();
    } catch (err) {
      console.error(err);
      setErrorMessage("删除失败，请稍后再试");
      setErrorDialogOpen(true);
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
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  仪表盘
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard/post")}
                >
                  文章管理
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
              <h1 className="text-2xl font-bold">文章列表</h1>
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
                      <TableHead>ID</TableHead>
                      <TableHead>Slug</TableHead>
                      {currentUser?.isAdmin && <TableHead>作者</TableHead>}
                      <TableHead>标题</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
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
                        {currentUser?.isAdmin && (
                          <TableCell>
                            <Skeleton className="h-4 w-15" />
                          </TableCell>
                        )}
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
                        className="cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        ID {renderSortIcon("id")}
                      </TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>作者</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("createdAt")}
                      >
                        创建时间 {renderSortIcon("createdAt")}
                      </TableHead>
                      <TableHead
                        className="cursor-pointer"
                        onClick={() => handleSort("updatedAt")}
                      >
                        更新时间 {renderSortIcon("updatedAt")}
                      </TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>{post.id}</TableCell>
                        <TableCell>{post.slug}</TableCell>

                        <TableCell>
                          {post.authors.length > 0
                            ? post.authors
                                .map((author) => author.user.id)
                                .join(", ")
                            : "匿名"}
                        </TableCell>

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
                            onClick={() => {
                              setDeleteId(post.id);
                              setShowDeleteDialog(true);
                            }}
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

      {/* 删除确认弹窗 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <p className="text-lg">
                确定要删除文章《{posts.find((p) => p.id === deleteId)?.title}
                》吗？
              </p>
            </AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复该文章，是否继续？
            </AlertDialogDescription>
            <AlertDialogDescription>
              Tips: 建议将文章状态改为“未发布”，而不是直接删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 错误提示弹窗 */}
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>操作失败</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              知道了
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarInset>
  );
}
