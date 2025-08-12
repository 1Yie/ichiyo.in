"use client";

import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoChevronDownSharp, IoDesktopOutline } from "react-icons/io5";
import { RiDashboard3Line } from "react-icons/ri";
import {
  MdOutlineDarkMode,
  MdOutlineLightMode,
  MdOutlineLogout,
  MdOutlineLogin,
} from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaRegUser } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useUser } from "@/contexts/user-context";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { userInfo, loading, logout, isAuthenticated } = useUser();

  const navItems = [
    { href: "/", label: "首页" },
    { href: "/blog", label: "博客" },
    { href: "/about", label: "关于" },
    { href: "/link", label: "友链" },
  ];

  function ThemeIcon({ theme }: { theme: "system" | "light" | "dark" }) {
    const [isSystemDark, setIsSystemDark] = useState(false);

    useEffect(() => {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => setIsSystemDark(mediaQuery.matches);
      setIsSystemDark(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    if (theme === "dark") return <MdOutlineDarkMode className="text-lg" />;
    if (theme === "light") return <MdOutlineLightMode className="text-lg" />;
    return isSystemDark ? (
      <MdOutlineDarkMode className="text-lg" />
    ) : (
      <MdOutlineLightMode className="text-lg" />
    );
  }

  const themeOptions = [
    {
      value: "system",
      label: "跟随系统",
      icon: <IoDesktopOutline size={18} />,
    },
    {
      value: "light",
      label: "浅色模式",
      icon: <MdOutlineLightMode size={18} />,
    },
    { value: "dark", label: "深色模式", icon: <MdOutlineDarkMode size={18} /> },
  ];

  const avatarUrl = userInfo?.avatar || "";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const UserAvatar = ({ size = "default" }: { size?: "default" | "small" }) => {
    const avatarClass = size === "small" ? "w-6 h-6" : "w-8 h-8";
    const iconClass = size === "small" ? "text-sm" : "";

    return (
      <Avatar className={avatarClass} key={isAuthenticated ? userInfo?.email : "logged-out"}>
        {isAuthenticated && userInfo ? (
          <AvatarImage
            src={avatarUrl}
            alt={userInfo.name} 
            onError={() => {
              /* 头像加载失败显示 fallback */
            }}
          />
        ) : null}
        <AvatarFallback>
          <FaRegUser className={`text-muted-foreground ${iconClass}`} />
        </AvatarFallback>
      </Avatar>
    );
  };

  const UserMenuItems = () => {
    if (isAuthenticated && userInfo) {
      return (
        <>
          <DropdownMenuItem
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground cursor-pointer transition-colors duration-200 hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          >
            <RiDashboard3Line size={18} />
            仪表盘
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-muted-foreground cursor-pointer transition-colors duration-200 hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          >
            <MdOutlineLogout size={18} />
            退出登录
          </DropdownMenuItem>
        </>
      );
    }

    return (
      <DropdownMenuItem
        onClick={() => router.push("/login")}
        className="text-muted-foreground cursor-pointer transition-colors duration-200 hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
      >
        <MdOutlineLogin size={18} />
        登录
      </DropdownMenuItem>
    );
  };

  return (
    <header className="border-b z-10">
      <section className="section-base">
        <div className="h-14 flex justify-between items-center px-4">
          <div className="flex items-center space-x-4 font-['Raleway',sans-serif]">
            <Link href="/">
              <p className="text-lg text-primary">ichiyo</p>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={`px-4 py-2 transition-colors duration-200 ${pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : ""
                          }`}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}

                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="px-2 py-2.5 cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md transition-colors flex items-center gap-1 group">
                      <ThemeIcon theme={theme as "system" | "light" | "dark"} />
                      <IoChevronDownSharp
                        size={12}
                        className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="min-w-[110px] mx-2 space-y-1"
                    >
                      {themeOptions.map(({ value, label, icon }) => (
                        <DropdownMenuItem
                          key={value}
                          className={`cursor-pointer flex items-center gap-2 transition-colors duration-200 ${theme === value
                              ? "bg-accent text-accent-foreground font-semibold"
                              : "text-muted-foreground"
                            }`}
                          onClick={() =>
                            setTheme(value as "system" | "light" | "dark")
                          }
                        >
                          {icon}
                          <span>{label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="px-2 py-1 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md transition-colors flex items-center gap-1 group cursor-pointer">
                      {loading ? (
                        <Skeleton className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserAvatar />
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="min-w-[110px] mx-2 space-y-1"
                    >
                      {loading ? (
                        <div className="p-2">
                          <Skeleton className="h-4 w-16 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ) : (
                        <UserMenuItems />
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <nav className="sm:hidden flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                <ThemeIcon theme={theme as "system" | "light" | "dark"} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="min-w-[110px] mx-2 space-y-1"
              >
                {themeOptions.map(({ value, label, icon }) => (
                  <DropdownMenuItem
                    key={value}
                    className={`cursor-pointer flex items-center gap-2 transition-colors duration-200 ${theme === value
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground"
                      }`}
                    onClick={() =>
                      setTheme(value as "system" | "light" | "dark")
                    }
                  >
                    {icon}
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                {loading ? (
                  <Skeleton className="w-6 h-6 rounded-full" />
                ) : (
                  <UserAvatar size="small" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="min-w-[110px] mx-2 space-y-1"
              >
                {loading ? (
                  <div className="p-2">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  <UserMenuItems />
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors">
                <RxHamburgerMenu size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="min-w-[80px] mx-2 space-y-1"
              >
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={`cursor-pointer flex items-center justify-center transition-colors duration-200 ${pathname === item.href
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground"
                        }`}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </section>
    </header>
  );
}