import DashboardNewPost from '@/app/ui/dashboard-new-post';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ichiyo | 新建文章',
};

export default function DashboardCreatePost() {
	return <DashboardNewPost />;
}
