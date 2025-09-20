"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { use } from "react";
import { toast } from "sonner";
import { Friend } from "@/types/config";
import DashboardLayout from "@/app/ui/dashboard-layout";

async function fetchStats() {
  const [postRes, projectRes, picRes, friendRes] = await Promise.all([
    fetch("/api/post").then((res) => {
      if (!res.ok) {
        toast.error("无法获取文章数据");
        throw new Error("Failed to fetch posts");
      }
      return res.json();
    }),
    fetch("/api/project").then((res) => {
      if (!res.ok) {
        toast.error("无法获取项目数据");
        throw new Error("Failed to fetch projects");
      }
      return res.json();
    }),
    fetch("/api/pic").then((res) => {
      if (!res.ok) {
        toast.error("无法获取图片数据");
        throw new Error("Failed to fetch pics");
      }
      return res.json();
    }),
    fetch("/api/friend").then((res) => {
      if (!res.ok) {
        toast.error("无法获取好友数据");
        throw new Error("Failed to fetch friends");
      }
      return res.json();
    }),
  ]);

  const postsArray = Array.isArray(postRes.posts) ? postRes.posts : [];
  const totalPosts = postsArray.length;
  const publishedPosts = postsArray.filter(
    (p: { published: boolean }) => p.published
  ).length;
  const draftPosts = totalPosts - publishedPosts;

  const projectsArray = Array.isArray(projectRes.projects)
    ? projectRes.projects
    : Array.isArray(projectRes)
    ? projectRes
    : [];

  const picsArray = Array.isArray(picRes.pics)
    ? picRes.pics
    : Array.isArray(picRes)
    ? picRes
    : [];

  const friendsArray: Friend[] = Array.isArray(friendRes.friends)
    ? friendRes.friends
    : Array.isArray(friendRes)
    ? friendRes
    : [];

  const pinnedCount = friendsArray.filter((f) => f.pinned === true).length;
  const unpinnedCount = friendsArray.length - pinnedCount;

  return {
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
  };
}

function StatsDisplay({
  statsPromise,
}: {
  statsPromise: Promise<{
    posts: {
      total: number;
      published: number;
      draft: number;
    };
    projects: number;
    pics: number;
    friends: {
      total: number;
      pinned: number;
      unpinned: number;
    };
  }>;
}) {
  const stats = use(statsPromise);

  return (
    <>
      {/* 文章统计 */}
      <div className="bg-muted/50 p-4 rounded-xl mb-2">
        <h2 className="text-xl font-semibold text-foreground/90 mb-2">
          文章统计
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-foreground/50 text-sm">总文章数</span>
            <span className="text-2xl font-medium text-foreground/80">
              {stats.posts.total}
            </span>
          </div>
          <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-foreground/50 text-sm">已发布</span>
            <span className="text-2xl font-medium text-foreground/80">
              {stats.posts.published}
            </span>
          </div>
          <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-foreground/50 text-sm">草稿</span>
            <span className="text-2xl font-medium text-foreground/80">
              {stats.posts.draft}
            </span>
          </div>
        </div>
      </div>

      {/* 项目统计 */}
      <div className="bg-muted/50 p-4 rounded-xl mb-2">
        <h2 className="text-xl font-semibold text-foreground/90 mb-2">
          项目统计
        </h2>
        <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start max-w-xs">
          <span className="text-foreground/50 text-sm">项目总数</span>
          <span className="text-2xl font-medium text-foreground/80">
            {stats.projects}
          </span>
        </div>
      </div>

      {/* 图片统计 */}
      <div className="bg-muted/50 p-4 rounded-xl mb-2">
        <h2 className="text-xl font-semibold text-foreground/90 mb-2">
          图片统计
        </h2>
        <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start max-w-xs">
          <span className="text-foreground/50 text-sm">图片总数</span>
          <span className="text-2xl font-medium text-foreground/80">
            {stats.pics}
          </span>
        </div>
      </div>

      {/* 友链统计 */}
      <div className="bg-muted/50 p-4 rounded-xl mb-2">
        <h2 className="text-xl font-semibold text-foreground/90 mb-2">
          友链统计
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-foreground/50 text-sm">友链总数</span>
            <span className="text-2xl font-medium text-foreground/80">
              {stats.friends.total}
            </span>
          </div>
          <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-foreground/50 text-sm">置顶人数</span>
            <span className="text-2xl font-medium text-foreground/80">
              {stats.friends.pinned}
            </span>
          </div>
          <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-foreground/50 text-sm">未置顶人数</span>
            <span className="text-2xl font-medium text-foreground/80">
              {stats.friends.unpinned}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardHome() {
  const statsPromise = fetchStats();
  return (
    <DashboardLayout breadcrumbs={[{ label: "仪表盘", href: "/dashboard" }]}>
      <Suspense
        fallback={
          <>
            <div className="bg-muted/50 p-4 rounded-xl">
              <h2 className="text-xl font-semibold text-foreground/90 mb-2">
                文章统计
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
                  <span className="text-foreground/50 text-sm">总文章数</span>
                  <Skeleton className="bg-foreground/10 h-7 w-16 mt-1" />
                </div>

                <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
                  <span className="text-foreground/50 text-sm">已发布</span>
                  <Skeleton className="bg-foreground/10 h-7 w-16 mt-1" />
                </div>

                <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
                  <span className="text-foreground/50 text-sm">草稿</span>
                  <Skeleton className="bg-foreground/10 h-7 w-16 mt-1" />
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl">
              <h2 className="text-xl font-semibold text-foreground/90 mb-2">
                项目统计
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
                  <span className="text-foreground/50 text-sm">项目总数</span>
                  <Skeleton className="bg-foreground/10 h-7 w-16 mt-1" />
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl">
              <h2 className="text-xl font-semibold text-foreground/90 mb-2">
                图片统计
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
                  <span className="text-foreground/50 text-sm">图片总数</span>
                  <Skeleton className="bg-foreground/10 h-7 w-16 mt-1" />
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-xl">
              <h2 className="text-xl font-semibold text-foreground/90 mb-2">
                友链统计
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
                  <span className="text-foreground/50 text-sm">友链总数</span>
                  <Skeleton className="bg-foreground/10 h-7 w-16 mt-1" />
                </div>

                <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
                  <span className="text-foreground/50 text-sm">置顶人数</span>
                  <Skeleton className="bg-foreground/10 h-7 w-16 mt-1" />
                </div>

                <div className="bg-muted/100 p-4 rounded-xl flex flex-col items-start">
                  <span className="text-foreground/50 text-sm">未置顶人数</span>
                  <Skeleton className="bg-foreground/10 h-7 w-16 mt-1" />
                </div>
              </div>
            </div>
          </>
        }
      >
        <StatsDisplay statsPromise={statsPromise} />
      </Suspense>
    </DashboardLayout>
  );
}
