import SplitText from "@/components/ui/split-text";

export default function ArchiveTitle() {
  return (
    <div className="border-b">
      <section className="flex justify-center items-start flex-col section-base bg-squares h-[15vh] sm:h-[20vh]">
        <div className="p-4">
          <SplitText
            text={"归档"}

            className="text-2xl sm:text-4xl"
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
