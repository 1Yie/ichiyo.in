import SplitText from '@/components/ui/split-text';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import FadeContent from '@/components/ui/fade-content';

const words = [
	'边缘',
	'CV战士',
	'AI依赖症',
	'程序猿',
	'BUG制造者',
	'咖啡依赖症',
	'拖延症晚期',
	'前端小透明',
];

export default function Home() {
	return (
		<div className="border-b">
			<section className="section-base bg-squares h-[60vh] p-3 sm:h-[80vh]">
				<div className="font-kinghwa flex min-h-full flex-col items-center justify-center text-center font-bold">
					<SplitText
						text={'存活于二十一世纪互联网'}
						className="text-3xl sm:text-5xl"
						delay={40}
						duration={0.6}
						ease="power3.out"
						splitType="chars"
						textAlign="center"
						from={{ opacity: 0, y: 40 }}
						to={{ opacity: 1, y: 0 }}
						threshold={0.1}
					/>

					<FadeContent
						blur={true}
						duration={420}
						easing="ease-out"
						initialOpacity={0}
					>
						<p className="m-2 text-2xl text-gray-400 sm:m-5 sm:text-4xl">の</p>
					</FadeContent>
					<ContainerTextFlip
						className="h-[5.5vh]"
						textClassName="text-3xl sm:text-5xl leading-none m-0 text-primary"
						interval={4000}
						words={words}
					/>
				</div>
			</section>
		</div>
	);
}
