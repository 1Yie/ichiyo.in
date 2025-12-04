import TagsMain from '@/app/ui/tags-main';
import TagsTitle from '@/app/ui/tags-title';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'ichiyo | 标签',
	description: '我的标签',
};

export default function Tags() {
	return (
		<>
			<TagsTitle />
			<TagsMain />
		</>
	);
}
