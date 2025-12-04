import type { Metadata } from 'next';
import ArchiveTitle from '@/app/ui/archive-title';
import ArchiveMain from '@/app/ui/archive-main';

export const metadata: Metadata = {
	title: 'ichiyo | 归档',
	description: '我的归档',
};

export default function Archive() {
	return (
		<>
			<ArchiveTitle />
			<ArchiveMain />
		</>
	);
}
