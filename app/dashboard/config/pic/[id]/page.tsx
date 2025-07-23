import DashboardConfigPicEdit from "@/ui/dashboard-config-pic-edit";

interface PageProps {
  params: {
    id: number;
  };
}

export default function PagePicEdit({ params }: PageProps) {
  const { id } = params;

  return <DashboardConfigPicEdit id={id} />;
}
