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

interface SocialLink {
  id: number;
  name: string;
  link: string;
}

interface Friend {
  id: number;
  name: string;
  image: string;
  description: string;
  pinned: boolean;
  socialLinks: SocialLink[];
}

type SortField = "id" | "name" | "description" | "pinned";
type SortOrder = "asc" | "desc";

export default function DashboardConfigFriend() {
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/friend", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("获取好友列表失败");
      const data = await res.json();
      setFriends(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      const res = await fetch(`/api/friend/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("删除失败");
      fetchFriends();
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

  const sortedFriends = useMemo(() => {
    if (!friends) return [];
    return [...friends].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (sortField === "id") {
        return sortOrder === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }
      if (sortField === "pinned") {
        // pinned 是 boolean，true > false
        return sortOrder === "asc"
          ? aVal === bVal
            ? 0
            : aVal
            ? 1
            : -1
          : aVal === bVal
          ? 0
          : aVal
          ? -1
          : 1;
      }

      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [friends, sortField, sortOrder]);

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
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink onClick={() => router.push("/dashboard")}>
                  仪表盘
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="cursor-pointer">
                <BreadcrumbLink
                  onClick={() => router.push("/dashboard/config/link")}
                >
                  友链
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
              <h1 className="text-2xl font-bold">友链列表</h1>
              <Button onClick={() => router.push("/dashboard/config/link/new")}>
                <Pencil className="mr-1 h-4 w-4" />
                新建友链
              </Button>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("id")}
                    >
                      ID {renderSortIcon("id")}
                    </TableHead>
                    <TableHead>头像</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>介绍</TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("pinned")}
                    >
                      置顶 {renderSortIcon("pinned")}
                    </TableHead>
                    <TableHead>社交链接数</TableHead>
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
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-16 inline-block" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : sortedFriends.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        暂无友链
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedFriends.map((friend) => (
                      <TableRow key={friend.id}>
                        <TableCell>{friend.id}</TableCell>
                        <TableCell>
                          <Image
                            src={friend.image}
                            alt={friend.name}
                            width={40}
                            height={40}
                            className="rounded-full border border-gray-300 object-cover"
                            unoptimized
                            priority
                          />
                        </TableCell>
                        <TableCell>{friend.name}</TableCell>
                        <TableCell>{friend.description}</TableCell>
                        <TableCell>{friend.pinned ? "是" : "否"}</TableCell>
                        <TableCell>{friend.socialLinks.length}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(`/dashboard/config/link/${friend.id}`)
                            }
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setDeleteId(friend.id);
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
            <AlertDialogTitle>确定要删除这条友链？</AlertDialogTitle>
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
