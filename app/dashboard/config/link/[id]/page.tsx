import DashboardConfigFriendEdit from "@/ui/dashboard-config-friend-edit";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PageLinkEdit(props: PageProps) {
  const params = await props.params;
  const id = Number(params.id);
  return <DashboardConfigFriendEdit id={id} />;
}
