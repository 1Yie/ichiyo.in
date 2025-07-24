"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";

interface Friend {
  pinned?: boolean;
}

export default function DashboardHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: { total: 0, published: 0, draft: 0 },
    projects: 0,
    pics: 0,
    friends: { total: 0, pinned: 0, unpinned: 0 },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/post").then((res) => res.json()),
      fetch("/api/project").then((res) => res.json()),
      fetch("/api/pic").then((res) => res.json()),
      fetch("/api/friend").then((res) => res.json()),
    ])
      .then(([postRes, projectRes, picRes, friendRes]) => {
        // 文章处理，确保posts是数组
        const postsArray = Array.isArray(postRes.posts) ? postRes.posts : [];
        const totalPosts = postsArray.length;
        const publishedPosts = postsArray.filter(
          (p: { published: boolean }) => p.published
        ).length;
        const draftPosts = totalPosts - publishedPosts;

        // 项目处理，支持直接数组或projects字段包裹
        const projectsArray = Array.isArray(projectRes.projects)
          ? projectRes.projects
          : Array.isArray(projectRes)
          ? projectRes
          : [];

        // 图片处理，支持直接数组或pics字段包裹
        const picsArray = Array.isArray(picRes.pics)
          ? picRes.pics
          : Array.isArray(picRes)
          ? picRes
          : [];

        // 朋友处理，支持直接数组或friends字段包裹
        const friendsArray: Friend[] = Array.isArray(friendRes.friends)
          ? friendRes.friends
          : Array.isArray(friendRes)
          ? friendRes
          : [];

        const pinnedCount = friendsArray.filter(
          (f) => f.pinned === true
        ).length;
        const unpinnedCount = friendsArray.length - pinnedCount;

        setStats({
          posts: {
            total: totalPosts,
            published: publishedPosts,
            draft: draftPosts,
          },
          projects: projectsArray.length,
          pics: picsArray.length,
          friends: {
            total: friendsArray.length,
            pinned: pinnedCount,
            unpinned: unpinnedCount,
          },
        });
      })
      .catch((err) => {
        console.error("统计数据获取失败", err);
      })
      .finally(() => setLoading(false));
  }, []);

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
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* 文章统计 */}
        <div className="bg-muted/50 p-4 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">文章统计</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl flex flex-col items-start">
              <span className="text-gray-500 text-sm">总文章数</span>
              {loading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <span className="text-2xl font-medium text-gray-800">
                  {stats.posts.total}
                </span>
              )}
            </div>
            <div className="bg-white p-4 rounded-xl flex flex-col items-start">
              <span className="text-gray-500 text-sm">已发布</span>
              {loading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <span className="text-2xl font-medium text-gray-800">
                  {stats.posts.published}
                </span>
              )}
            </div>
            <div className="bg-white p-4 rounded-xl flex flex-col items-start">
              <span className="text-gray-500 text-sm">草稿</span>
              {loading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <span className="text-2xl font-medium text-gray-800">
                  {stats.posts.draft}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 项目统计 */}
        <div className="bg-muted/50 p-4 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">项目统计</h2>
          <div className="bg-white p-4 rounded-xl flex flex-col items-start max-w-xs">
            <span className="text-gray-500 text-sm">项目总数</span>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <span className="text-2xl font-medium text-gray-800">
                {stats.projects}
              </span>
            )}
          </div>
        </div>

        {/* 图片统计 */}
        <div className="bg-muted/50 p-4 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">图片统计</h2>
          <div className="bg-white p-4 rounded-xl flex flex-col items-start max-w-xs">
            <span className="text-gray-500 text-sm">图片总数</span>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <span className="text-2xl font-medium text-gray-800">
                {stats.pics}
              </span>
            )}
          </div>
        </div>

        {/* 友链统计 */}
        <div className="bg-muted/50 p-4 rounded-xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">友链统计</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl flex flex-col items-start">
              <span className="text-gray-500 text-sm">友链总数</span>
              {loading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <span className="text-2xl font-medium text-gray-800">
                  {stats.friends.total}
                </span>
              )}
            </div>
            <div className="bg-white p-4 rounded-xl flex flex-col items-start">
              <span className="text-gray-500 text-sm">置顶人数</span>
              {loading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <span className="text-2xl font-medium text-gray-800">
                  {stats.friends.pinned}
                </span>
              )}
            </div>
            <div className="bg-white p-4 rounded-xl flex flex-col items-start">
              <span className="text-gray-500 text-sm">未置顶人数</span>
              {loading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <span className="text-2xl font-medium text-gray-800">
                  {stats.friends.unpinned}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 预留空白区域 */}
        {/* <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
      </div>
    </SidebarInset>
  );
}
