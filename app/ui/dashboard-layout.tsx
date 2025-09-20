"use client";

import { ReactNode } from "react";
import { useRouter } from "nextjs-toploader/app";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

interface BreadcrumbItemType {
  label: string;
  href?: string;
  textClassName?: string;
}

interface DashboardLayoutProps {
  breadcrumbs: BreadcrumbItemType[];
  children: ReactNode;
}

export default function DashboardLayout({
  breadcrumbs,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();

  return (
    <SidebarInset>
      {/* Header + Breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 bg-foreground/30"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => (
                <div key={index} className="inline-flex items-center gap-1.5">
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink
                        onClick={() => item.href && router.push(item.href)}
                        className="cursor-pointer hover:text-foreground/90"
                      >
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </BreadcrumbItem>

                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="text-foreground/80" />
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full w-full">
        <div className="bg-muted/50 dark:bg-muted/50 flex-1 rounded-xl p-4 h-full w-full min-w-0">
          <div className="bg-white dark:bg-muted/50 rounded-xl p-4 h-full w-full min-w-0 flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
