import DashboardConfigFriendEdit from '@/ui/dashboard-config-friend-edit';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ichiyo | 编辑友链',
};

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function PageLinkEdit(props: PageProps) {
	const params = await props.params;
	const id = Number(params.id);
	return <DashboardConfigFriendEdit id={id} />;
}
