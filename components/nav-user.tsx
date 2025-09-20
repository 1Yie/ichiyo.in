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
import { useTheme } from "next-themes";
import { IoDesktopOutline } from "react-icons/io5";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { useRouter } from "nextjs-toploader/app";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/user-context";

export function NavUser() {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { userInfo, loading, logout, error, refreshUser } = useUser();

  if (error && !userInfo) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="p-4 text-center">
            <p className="text-sm text-red-600 mb-2">加载失败</p>
            <button
              onClick={refreshUser}
              className="text-xs text-blue-600 hover:underline"
            >
              重试
            </button>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const adminFlag = userInfo?.isSuperAdmin ? (
    <Badge className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-1 py-0 rounded">
      超级管理员
    </Badge>
  ) : userInfo?.isAdmin ? (
    <Badge className="text-xs font-semibold text-red-600 bg-red-100 px-1 py-0 rounded">
      管理员
    </Badge>
  ) : (
    <Badge className="text-xs font-semibold text-gray-400 bg-gray-100 px-1 py-0 rounded">
      成员
    </Badge>
  );

  const themeOptions = [
    {
      value: "system",
      label: "跟随系统",
      icon: <IoDesktopOutline size={20} />,
    },
    {
      value: "light",
      label: "浅色模式",
      icon: <MdOutlineLightMode size={20} />,
    },
    {
      value: "dark",
      label: "深色模式",
      icon: <MdOutlineDarkMode size={20} />,
    },
  ];

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
                userInfo && (
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
                )
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
                userInfo && (
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
                )
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <IoSettingsOutline />
              设置
            </DropdownMenuItem>
            {!loading && userInfo && (
              <>
                <DropdownMenuSeparator />

                {/* 横排三图标 */}
                <div className="flex justify-center gap-2 py-2">
                  {themeOptions.map(({ value, icon }) => (
                    <button
                      key={value}
                      title={value}
                      onClick={() =>
                        setTheme(value as "system" | "light" | "dark")
                      }
                      className={`p-1.5 rounded-md transition-colors ${
                        theme === value
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={logout}>
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
