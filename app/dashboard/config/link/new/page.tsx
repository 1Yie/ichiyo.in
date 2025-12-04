import DashboardConfigFriendNew from '@/ui/dashboard-config-friend-new';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ichiyo | 新建友链',
};

export default function Page() {
	return <DashboardConfigFriendNew />;
}
