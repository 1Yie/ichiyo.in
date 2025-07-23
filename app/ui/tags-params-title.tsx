import SplitText from "@/components/ui/split-text";

export default function TagsParamsTitle({ title }: { title: string }) {
  return (
    <div className="border-b">
      <section className="flex justify-center items-start flex-col section-base bg-squares h-[12vh] sm:h-[15vh]">
        <div className="p-4">
          <SplitText
            text={title}
            className="text-2xl sm:text-4xl"
            delay={30}
            duration={0.4}
            ease="power3.out"
            splitType="chars"
            textAlign="left"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
          />
        </div>
      </section>
    </div>
  );
}
