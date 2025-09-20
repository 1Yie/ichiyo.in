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
import DashboardLayout from "@/app/ui/dashboard-layout";
import { request } from "@/hooks/use-request";
import type { Friend } from "@/types/config";

type SortField = "id" | "name" | "description" | "pinned";
type SortOrder = "asc" | "desc";

async function fetchFriendsData(): Promise<Friend[]> {
  const res = await request("/api/friend", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res) throw new Error("获取好友列表失败");
  const data = res;
  return Array.isArray(data) ? data : [];
}

function FriendList({ friends }: { friends: Promise<Friend[]> }) {
  const initialData = use(friends);
  const [data, setData] = useState(initialData);

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
      const res = await request(`/api/friend/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      if (!res) throw new Error("删除失败");

      setData((prev) => prev.filter((friend) => friend.id !== deleteId));

      toast.success(`ID 为 ${deleteId} 的友链已被删除`);
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

  const sortedFriends = useMemo(() => {
    return [...data].sort((a, b) => {
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
  }, [data, sortField, sortOrder]);

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
            <TableHead className="text-foreground/90">头像</TableHead>
            <TableHead className="text-foreground/90">名称</TableHead>
            <TableHead className="text-foreground/90">介绍</TableHead>
            <TableHead
              className="cursor-pointer select-none text-foreground/90"
              onClick={() => handleSort("pinned")}
            >
              置顶 {renderSortIcon("pinned")}
            </TableHead>
            <TableHead className="text-foreground/90">社交链接数</TableHead>
            <TableHead className="text-right text-foreground/90">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFriends.length === 0 ? (
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
                <TableCell className="text-foreground/90">
                  {friend.id}
                </TableCell>
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
                <TableCell className="text-foreground/90">
                  {friend.name}
                </TableCell>
                <TableCell className="text-foreground/90">
                  {friend.description}
                </TableCell>
                <TableCell className="text-foreground/90">
                  {friend.pinned ? "是" : "否"}
                </TableCell>
                <TableCell className="text-foreground/90">
                  {friend.socialLinks.length}
                </TableCell>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除这条友链？</AlertDialogTitle>
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

export default function DashboardConfigFriendSuspenseWrapper() {
  const friendsPromise = useMemo(() => fetchFriendsData(), []);
  const router = useRouter();

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "配置", href: "/dashboard/config" },
        { label: "友链", href: "/dashboard/config/link" },
      ]}
    >
      <div className="flex items-center justify-between mb-4 ml-2 mr-2">
        <h1 className="text-2xl font-bold text-foreground/90">友链列表</h1>
        <Button onClick={() => router.push("/dashboard/config/link/new")}>
          <Pencil className="mr-1 h-4 w-4" />
          新建友链
        </Button>
      </div>
      <div className="rounded-xl bg-muted/50 p-4">
        <Suspense fallback={<FriendListSkeleton />}>
          <FriendList friends={friendsPromise} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

function FriendListSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">ID</TableHead>
          <TableHead>头像</TableHead>
          <TableHead>名称</TableHead>
          <TableHead>介绍</TableHead>
          <TableHead>置顶</TableHead>
          <TableHead>社交链接数</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-6" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-10 w-10 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-6" />
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Skeleton className="inline-block h-8 w-12 rounded" />
              <Skeleton className="inline-block h-8 w-12 rounded" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
