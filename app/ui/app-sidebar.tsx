"use client";

import * as React from "react";

import { GalleryVerticalEnd, Cog, NotebookTabs } from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  teams: [
    {
      name: "ichiyo.in",
      logo: GalleryVerticalEnd,
      plan: "仪表盘",
    },
  ],
  navSiteConfig: [
    {
      title: "配置管理",
      url: "#",
      icon: Cog,
      isActive: true,
      items: [
        { title: "作品", url: "#" },
        { title: "友链", url: "#" },
        { title: "图片", url: "#" },
      ],
    },
  ],
  navBlogConfig: [
    {
      name: "文章管理",
      url: "/dashboard/post",
      icon: NotebookTabs,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="站点" items={data.navSiteConfig} />
        <NavProjects label="博客" projects={data.navBlogConfig} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
