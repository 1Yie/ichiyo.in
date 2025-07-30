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
import md5 from "md5";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [user, setUser] = useState<null | { email: string; id: string }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.status === 401) {
          setUser(null);
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

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

  const emailHash = user?.email ? md5(user.email.trim().toLowerCase()) : "";
  const avatarUrl = user?.email
    ? `https://dn-qiniu-avatar.qbox.me/avatar/${emailHash}?d=identicon`
    : "";

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setUser(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
                        className={`px-4 py-2 transition-colors duration-200 ${
                          pathname === item.href
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
                          className={`cursor-pointer flex items-center gap-2 transition-colors duration-200 ${
                            theme === value
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
                        <Avatar key={user ? user.id : "logged-out"}>
                          {user ? (
                            <AvatarImage
                              src={avatarUrl}
                              alt="User Avatar"
                              onError={() => {
                                /* 头像加载失败显示 fallback */
                              }}
                            />
                          ) : null}
                          <AvatarFallback>
                            <FaRegUser className="text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="min-w-[110px] mx-2 space-y-1"
                    >
                      {user ? (
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
                      ) : (
                        <DropdownMenuItem
                          onClick={() => router.push("/login")}
                          className="text-muted-foreground cursor-pointer transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                        >
                          <MdOutlineLogin size={18} />
                          登录
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* 移动端 */}
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
                    className={`cursor-pointer flex items-center gap-2 transition-colors duration-200 ${
                      theme === value
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
                  <Avatar className="w-6 h-6" key={user ? user.id : "logged-out"}>
                    {user ? (
                      <AvatarImage
                        src={avatarUrl}
                        alt="User Avatar"
                        onError={() => {
                          /* 头像加载失败显示 fallback */
                        }}
                      />
                    ) : null}
                    <AvatarFallback>
                      <FaRegUser className="text-muted-foreground text-sm" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="min-w-[110px] mx-2 space-y-1"
              >
                {user ? (
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
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push("/login")}
                    className="text-muted-foreground cursor-pointer transition-colors duration-200 hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                  >
                    <MdOutlineLogin size={18} />
                    登录
                  </DropdownMenuItem>
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
                      className={`cursor-pointer flex items-center justify-center transition-colors duration-200 ${
                        pathname === item.href
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
