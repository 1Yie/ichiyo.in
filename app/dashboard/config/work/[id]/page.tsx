import DashboardEditProject from "@/ui/dashboard-config-work-edit";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ichiyo | 编辑作品",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PageDashboardEditProject(props: PageProps) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) return <div>非法 ID</div>;
  return <DashboardEditProject projectId={id} />;
}
