"use client";
import { Ban } from "lucide-react";
import DashboardLayout from "@/app/ui/dashboard-layout";

export default function DashboardError() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "仪表盘", href: "/dashboard" }]}>
      <div className="flex-1 rounded-xl p-4 bg-diagonal-stripes">
        <div className="w-full h-full rounded-xl flex justify-center items-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <Ban className="w-18 h-18 text-foreground/90" />
            <h1 className="text-lg text-foreground/90">访问的路径不存在</h1>
            <p className="text-sm text-foreground/90">
              请检查路径是否正确，或者联系管理员。
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
