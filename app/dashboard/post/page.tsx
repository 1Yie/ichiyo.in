import DashboardPost from '@/app/ui/dashboard-post';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ichiyo | 文章管理',
};

export default function Post() {
	return (
		<>
			<DashboardPost />
		</>
	);
}
