"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  // BreadcrumbPage,
  // BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "nextjs-toploader/app";

export default function DashboardHome() {
  const router = useRouter();

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
                <BreadcrumbLink className="cursor-pointer" onClick={() => router.push('/dashboard')}>仪表盘</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video p-3 rounded-xl grid grid-cols-2 grid-rows-2 gap-3">
            <div className="flex flex-col bg-white p-2 rounded-xl">
              <h1 className="text-3xl text-gray-600">文章数量</h1>
              <p className="text-2xl text-gray-500">100</p>
            </div>
            <div className="flex flex-col bg-white p-2 rounded-xl">
              <h1 className="text-3xl text-gray-600">评论数量</h1>
              <p className="text-2xl text-gray-500">100</p>
            </div>
            <div className="flex flex-col bg-white p-2 rounded-xl">
              <h1 className="text-3xl text-gray-600">阅读数量</h1>
              <p className="text-2xl text-gray-500">100</p>
            </div>
          </div>
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </SidebarInset>
  );
}
