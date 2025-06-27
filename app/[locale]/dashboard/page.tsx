import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/[...nextauth]/route";
import { redirect } from "next/navigation";

interface Props {
  params: {
    locale: string;
  };
}

export default async function DashboardPage({ params }: Props) {
  const session = await getServerSession({
    ...authOptions,
    session: {
      strategy: "jwt" as const,
    },
  });
  if (!session) {
    redirect(`/${params.locale}/dashboard/login`);
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>
      <p>欢迎，{session.user?.name || session.user?.email}！</p>
    </main>
  );
}
