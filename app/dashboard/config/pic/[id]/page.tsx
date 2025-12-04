import DashboardConfigPicEdit from '@/ui/dashboard-config-pic-edit';

import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ichiyo | 编辑图片',
};

interface PageProps {
	params: Promise<{
		id: number;
	}>;
}

export default async function PagePicEdit(props: PageProps) {
	const params = await props.params;
	const { id } = params;

	return <DashboardConfigPicEdit id={id} />;
}
