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

import {
  IoLanguageSharp,
  IoChevronDownSharp,
  IoDesktopOutline,
} from "react-icons/io5";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "../i18n/navigation";
import { useThemeSwitcher } from "@/lib/use-theme-switcher";

export default function Header() {
  const i18n = useTranslations("ui-header");
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { theme, setAppTheme } = useThemeSwitcher();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const enabled = theme === "dark" || (!theme && systemDark);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const navItems = [
    { href: "/", label: i18n("home") },
    { href: "/blog", label: i18n("blog") },
    { href: "/about", label: i18n("about") },
    { href: "/link", label: i18n("link") },
  ];

  const languages = [
    { locale: "zh", label: "中文" },
    { locale: "en", label: "English" },
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
      label: i18n("follow-system"),
      icon: <IoDesktopOutline size={18} />,
    },
    {
      value: "light",
      label: i18n("light"),
      icon: <MdOutlineLightMode size={18} />,
    },
    {
      value: "dark",
      label: i18n("dark"),
      icon: <MdOutlineDarkMode size={18} />,
    },
  ];

  return (
    <header className="border-b z-10">
      <section className="section-base">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-4 font-['Raleway',sans-serif]">
            <Link href="/">
              <p className="text-lg text-primary">{i18n("title")}</p>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={`px-4 py-2 ${
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
                    <DropdownMenuTrigger className="px-4 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md transition-colors flex items-center gap-1 group">
                      <IoLanguageSharp className="text-lg" />
                      <IoChevronDownSharp
                        size={12}
                        className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="min-w-[120px] space-y-1"
                    >
                      {languages.map(({ locale, label }) => (
                        <DropdownMenuItem key={locale} asChild>
                          <Link
                            href={pathname}
                            locale={locale}
                            className={`cursor-pointer ${
                              currentLocale === locale
                                ? "bg-accent text-accent-foreground font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            {label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="px-4 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md transition-colors flex items-center gap-1 group">
                      <ThemeIcon theme={theme} />
                      <IoChevronDownSharp
                        size={12}
                        className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="min-w-[120px] space-y-1"
                    >
                      {themeOptions.map(({ value, label, icon }) => (
                        <DropdownMenuItem
                          key={value}
                          className={`cursor-pointer flex items-center gap-2 ${
                            theme === value
                              ? "bg-accent text-accent-foreground font-semibold"
                              : "text-muted-foreground"
                          }`}
                          onClick={() =>
                            setAppTheme(value as "system" | "light" | "dark")
                          }
                        >
                          {icon}
                          <span>{label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <nav className="sm:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                <IoLanguageSharp className="text-lg" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[120px] space-y-1"
              >
                {languages.map(({ locale, label }) => (
                  <DropdownMenuItem key={locale} asChild>
                    <Link
                      href={pathname}
                      locale={locale}
                      className={`cursor-pointer ${
                        currentLocale === locale
                          ? "bg-accent text-accent-foreground font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                <ThemeIcon theme={theme} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[150px] space-y-1"
              >
                {themeOptions.map(({ value, label, icon }) => (
                  <DropdownMenuItem
                    key={value}
                    className={`cursor-pointer flex items-center gap-2 ${
                      theme === value
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-muted-foreground"
                    }`}
                    onClick={() =>
                      setAppTheme(value as "system" | "light" | "dark")
                    }
                  >
                    {icon}
                    <span>{label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                <RxHamburgerMenu size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-2 space-y-1 z-50">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={`cursor-pointer ${
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
