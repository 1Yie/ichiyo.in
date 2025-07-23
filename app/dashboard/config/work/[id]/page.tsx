"use client";
import DashboardEditProject from "@/ui/dashboard-config-work-edit";

interface PageProps {
  params: { id: string };
}

export default function PageDashboardEditProject({ params }: PageProps) {
  const id = Number(params.id);
  if (isNaN(id)) return <div>非法 ID</div>;
  return <DashboardEditProject projectId={id} />;
}
