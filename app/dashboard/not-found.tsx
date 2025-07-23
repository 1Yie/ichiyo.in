import { Metadata } from "next";

import DashboardError from "@/ui/dashboard-error";

export const metadata: Metadata = {
  title: "ichiyo | 404",
};

export default function NotFound() {
  return (
    <>
      <DashboardError />
    </>
  );
}
