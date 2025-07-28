import SplitText from "@/components/ui/split-text";

export default function TagsParamsTitle({ title }: { title: string }) {
  return (
    <div className="border-b">
      <section className="flex justify-center items-start flex-col section-base bg-squares h-[12vh] sm:h-[15vh]">
        <div className="p-4 flex items-center text-left">
          <SplitText
            text={"#"}
            className="text-2xl sm:text-4xl mr-2 text-gray-600 dark:text-gray-400 inline-block"
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
            className="text-2xl sm:text-4xl inline-block"
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
