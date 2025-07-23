import DashboardConfigPicEdit from "@/ui/dashboard-config-pic-edit";

interface PageProps {
  params: Promise<{
    id: number;
  }>;
}

export default async function PagePicEdit(props: PageProps) {
  const params = await props.params;
  const { id } = params;

  return <DashboardConfigPicEdit id={id} />;
}
