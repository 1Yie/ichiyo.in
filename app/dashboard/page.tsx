import DashboardHome from "@/app/ui/dashboard-home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ichiyo | 仪表盘",
};

export default function DashboardPage() {
  return (
    <>
      <DashboardHome />
    </>
  );
}
