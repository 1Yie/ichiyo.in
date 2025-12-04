import SplitText from '@/components/ui/split-text';

export default function TagsParamsTitle({ title }: { title: string }) {
	return (
		<div className="border-b">
			<section className="section-base bg-squares flex h-[12vh] flex-col items-start justify-center sm:h-[15vh]">
				<div className="flex items-center p-4 text-left">
					<SplitText
						text={'#'}
						className="mr-2 inline-block text-2xl text-gray-600 sm:text-4xl dark:text-gray-400"
						delay={30}
						duration={0.4}
						ease="power3.out"
						splitType="chars"
						from={{ opacity: 0, y: 40 }}
						to={{ opacity: 1, y: 0 }}
						threshold={0.1}
					/>
					<SplitText
						text={title}
						className="inline-block text-2xl sm:text-4xl"
						delay={30}
						duration={0.4}
						ease="power3.out"
						splitType="chars"
						from={{ opacity: 0, y: 40 }}
						to={{ opacity: 1, y: 0 }}
						threshold={0.1}
					/>
				</div>
			</section>
		</div>
	);
}
