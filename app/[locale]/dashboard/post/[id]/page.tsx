import DashboardEditPost from "@/ui/dashboard-edit-post";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DashboardPostEditPage(props: Props) {
  const params = await props.params;
  const postId = Number(params.id);

  if (isNaN(postId)) {
    return <p>无效文章ID</p>;
  }

  return <DashboardEditPost postId={postId} />;
}
