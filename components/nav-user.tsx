"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import md5 from "md5";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const [userInfo, setUserInfo] = React.useState<{
    name: string;
    email: string;
    avatar: string;
    isAdmin?: boolean;
  }>({
    name: "",
    email: "",
    avatar: "",
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            const email = data.user.email || "unknown@example.com";
            const name = data.user.id || "用户";
            const emailHash = md5(email.trim().toLowerCase());
            const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
            setUserInfo({
              name,
              email,
              avatar: gravatarUrl,
              isAdmin: data.user.isAdmin,
            });
          } else {
            router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    router.replace("/login");
  };

  // 提取管理员标识 JSX
  const adminFlag = userInfo.isAdmin ? (
    <span className="text-xs font-semibold text-red-600 bg-red-100 px-1 rounded">
      管理员
    </span>
  ) : (
    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-1 rounded">
      成员
    </span>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {loading ? (
                <>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex flex-col flex-1 gap-1 px-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-4 w-4 ml-auto" />
                </>
              ) : (
                <>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                    <AvatarFallback className="rounded-lg">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight px-2">
                    <span className="truncate font-medium flex items-center gap-1">
                      {userInfo.name}
                      {adminFlag}
                    </span>
                    <span className="truncate text-xs">{userInfo.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-[224px] rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              {loading ? (
                <div className="flex items-center gap-2 px-1 py-1.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex flex-col flex-1 gap-1">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                    <AvatarFallback className="rounded-lg">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium flex items-center gap-1">
                      {userInfo.name}
                      {adminFlag}
                    </span>
                    <span className="truncate text-xs">{userInfo.email}</span>
                  </div>
                </div>
              )}
            </DropdownMenuLabel>
            {!loading && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut />
                  退出登录
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
