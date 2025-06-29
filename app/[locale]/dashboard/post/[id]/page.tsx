import DashboardEditPost from "@/ui/dashboard-edit-post";

interface Props {
  params: { id: string };
}

export default function DashboardPostEditPage({ params }: Props) {
  const postId = Number(params.id);

  if (isNaN(postId)) {
    return <p>无效文章ID</p>;
  }

  return <DashboardEditPost postId={postId} />;
}
