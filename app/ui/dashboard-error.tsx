"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "nextjs-toploader/app";
import { Ban } from "lucide-react";

export default function DashboardError() {
  const router = useRouter();

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 bg-foreground/30"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer text-foreground/90"
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
        <div className="bg-muted/50 flex-1 rounded-xl p-4 bg-diagonal-stripes">
          <div className="w-full h-full rounded-xl flex justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Ban className="w-18 h-18 text-foreground/90" />
              <h1 className="text-lg text-foreground/90">访问的路径不存在</h1>
              <p className="text-sm text-foreground/90">请检查路径是否正确，或者联系管理员。</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
