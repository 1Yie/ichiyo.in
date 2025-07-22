import { Metadata } from "next";
import { SidebarInset } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "ichiyo | 404",
};

export default function NotFound() {
  return (
    <>
      <SidebarInset>
        <div className="p-3">404 Not Found</div>
      </SidebarInset>
    </>
  );
}