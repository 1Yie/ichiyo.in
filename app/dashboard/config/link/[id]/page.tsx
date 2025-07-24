import DashboardConfigFriendEdit from "@/ui/dashboard-config-friend-edit";

interface PageProps {
  params: { id: string };
}

export default async function PageLinkEdit({ params }: PageProps) {
  const id = Number(params.id);
  return <DashboardConfigFriendEdit id={id} />;
}
