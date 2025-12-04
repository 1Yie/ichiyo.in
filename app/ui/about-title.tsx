import SplitText from '@/components/ui/split-text';
import FadeContent from '@/components/ui/fade-content';

export default function AboutTitle() {
	return (
		<div className="border-b">
			<section className="section-base bg-squares flex h-[15vh] flex-col items-start justify-center sm:h-[20vh]">
				<div className="p-4">
					<SplitText
						text={'关于'}
						className="text-2xl sm:text-4xl"
						delay={30}
						duration={0.4}
						ease="power3.out"
						splitType="chars"
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
						<p className="text-sm text-gray-600 sm:text-lg dark:text-gray-300">
							逍遥天地间，心梦随云烟。
						</p>
					</FadeContent>
				</div>
			</section>
		</div>
	);
}
